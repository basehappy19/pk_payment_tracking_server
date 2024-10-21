const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const validateRequiredFields = require("../../Functions/validateRequiredFields");

exports.getLevels = async (req,res) => {
    try {
        const { search, page = 1, pageSize = 10 } = req.query; 
        
        const pageNumber = parseInt(page);
        const size = parseInt(pageSize);
        
        const skip = (pageNumber - 1) * size;

        const [levels, totalRecords] = await Promise.all([
            prisma.levels.findMany({
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
            prisma.levels.count({
                where: search ? { name: { contains: search } } : {},
            }),
        ]);

        const totalPages = Math.ceil(totalRecords / size);

        res.status(200).json({
            data: levels,
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

exports.AddLevel = async (req,res) => {
    try {
        const { name } = req.body;

        const requiredFields = {
            name: 'Name',
        };
    
        const errorMessage = validateRequiredFields(req.body, requiredFields);
    
        if (errorMessage) {
            return res.status(400).json({ message: errorMessage, type: 'error' });
        }

        const existingLevel = await prisma.levels.findFirst({
            where: {      
                name:name
            },
        });

        if (existingLevel) {
            return res.status(200).json({
                message: `ระดับชั้น ${name} มีซ้ำในระบบแล้ว`,
                type: 'error',
            });
        }

        await prisma.levels.create({data:{name}});
        res.json({message:`เพิ่มระดับชั้น ${name} เรียบร้อยแล้ว`,type:'success'}).status(201);
    } catch (e) {
        console.error(e);
        res.status(500).send('Server Error');
    }
}

exports.EditLevel = async (req,res) => {
    try {
        const { id, name } = req.body;

        const requiredFields = {
            id: 'Id',
            name: 'Name',
        };
    
        const errorMessage = validateRequiredFields(req.body, requiredFields);
    
        if (errorMessage) {
            return res.status(400).json({ message: errorMessage, type: 'error' });
        }

        const existingLevel = await prisma.levels.findFirst({
            where: {      
                name:name
            },
        });

        if (existingLevel) {
            return res.status(200).json({
                message: `ระดับชั้น ${name} มีซ้ำในระบบแล้ว`,
                type: 'error',
            });
        }

        await prisma.levels.update({
            where:{
                id:id
            },
            data:{
                name:name
            }
        });
        res.json({message:`แก้ไขระดับชั้น ${name} เรียบร้อยแล้ว`,type:'success'}).status(204);
    } catch (e) {
        console.error(e);
        res.status(500).send('Server Error');
    }
}

exports.RemoveLevel = async (req,res) => {
    try {
        const { id } = req.body;

        const requiredFields = {
            id: 'Id',
        };
    
        const errorMessage = validateRequiredFields(req.body, requiredFields);
    
        if (errorMessage) {
            return res.status(400).json({ message: errorMessage, type: 'error' });
        }
        const level = await prisma.levels.findFirst({where:{
            id:id
        }})

        if(!level){
            return res.json({message:`ไม่สามารถลบได้ ไม่พบระดับชั้น`,type:'error'}).status(404);
        }

        await prisma.levels.delete({
            where:{
                id:level.id
            },
        });
        res.json({message:`ลบระดับชั้น ${level.name} เรียบร้อยแล้ว`,type:'success'}).status(204);
    } catch (e) {
        console.error(e);
        res.status(500).send('Server Error');
    }
}

