const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const ValidateRequiredFields = require("../../Functions/ValidateRequiredFields");

exports.getRooms = async (req,res) => {
    try {
        const { search, page = 1, pageSize = 15 } = req.query; 
        
        const pageNumber = parseInt(page);
        const size = parseInt(pageSize);
        
        const skip = (pageNumber - 1) * size;

        const [rooms, totalRecords] = await Promise.all([
            prisma.rooms.findMany({
                where: search
                    ? {
                        name: {
                            contains: search,
                        },
                    }
                    : {},
                skip: skip, 
                take: size,  
            }),
            prisma.rooms.count({
                where: search ? { name: { contains: search } } : {},
            }),
        ]);

        const totalPages = Math.ceil(totalRecords / size);

        res.status(200).json({
            data: rooms,
            pagination: {
                totalRecords,
                totalPages,
                currentPage: pageNumber,
                pageSize: size,
            },
        });
    } catch (e) {
        console.error(e);
        res.status(500).send('Server Error');
    }
}

exports.AddRoom = async (req,res) => {
    try {
        const { name } = req.body;

        const requiredFields = {
            name: 'Name',
        };
    
        const errorMessage = ValidateRequiredFields(req.body, requiredFields);
    
        if (errorMessage) {
            return res.status(400).json({ message: errorMessage, type: 'error' });
        }

        const existingRoom = await prisma.rooms.findFirst({
            where: {      
                name:name
            },
        });

        if (existingRoom) {
            return res.status(200).json({
                message: `ห้อง ${name} มีซ้ำในระบบแล้ว`,
                type: 'error',
            });
        }

        await prisma.rooms.create({data:{name}});
        res.json({message:`เพิ่มห้อง ${name} เรียบร้อยแล้ว`,type:'success'}).status(201);
    } catch (e) {
        console.error(e);
        res.status(500).send('Server Error');
    }
}

exports.EditRoom = async (req,res) => {
    try {
        const { id, name } = req.body;

        const requiredFields = {
            id: 'Id',
            name: 'Name',
        };
    
        const errorMessage = ValidateRequiredFields(req.body, requiredFields);
    
        if (errorMessage) {
            return res.status(400).json({ message: errorMessage, type: 'error' });
        }

        const existingRoom = await prisma.rooms.findFirst({
            where: {      
                name:name
            },
        });

        if (existingRoom) {
            return res.status(200).json({
                message: `ห้อง ${name} มีซ้ำในระบบแล้ว`,
                type: 'error',
            });
        }

        await prisma.rooms.update({
            where:{
                id:id
            },
            data:{
                name:name
            }
        });
        res.json({message:`แก้ไขห้อง ${name} เรียบร้อยแล้ว`,type:'success'}).status(204);
    } catch (e) {
        console.error(e);
        res.status(500).send('Server Error');
    }
}

exports.RemoveRoom = async (req,res) => {
    try {
        const { id } = req.body;

        const requiredFields = {
            id: 'Id',
        };
    
        const errorMessage = ValidateRequiredFields(req.body, requiredFields);
    
        if (errorMessage) {
            return res.status(400).json({ message: errorMessage, type: 'error' });
        }
        const room = await prisma.rooms.findFirst({where:{
            id:id
        }})

        if(!room){
            return res.json({message:`ไม่สามารถลบได้ ไม่พบห้อง`,type:'error'}).status(404);
        }

        await prisma.rooms.delete({
            where:{
                id:room.id
            },
        });
        res.json({message:`ลบห้อง ${room.name} เรียบร้อยแล้ว`,type:'success'}).status(204);
    } catch (e) {
        console.error(e);
        res.status(500).send('Server Error');
    }
}

