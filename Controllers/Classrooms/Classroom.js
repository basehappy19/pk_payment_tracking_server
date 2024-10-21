const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const validateRequiredFields = require("../../Functions/validateRequiredFields");

exports.getClassroomOptions = async (req,res) => {
    try {
        if(req.user.roleId < 1){
            return res.status(401).json({ message: 'คุณไม่มีสิทธิ์เข้าถึง', type: 'error' });
        }
        const classrooms = await prisma.classrooms.findMany({
            select:{
                id:true,
                education_year:{
                    select:{
                        id:true,
                        name:true,
                    }
                },
                education_term:{
                    select:{
                        id:true,
                        name:true,
                    }
                },
                level:{
                    select:{
                        id:true,
                        name:true,
                    }
                },
                room:{
                    select:{
                        id:true,
                        name:true,
                    }
                },
            }
        });
        const education_years = await prisma.educationYears.findMany({
            select:{
                id:true,
                name:true,
            }
        });
        const education_terms = await prisma.educationTerms.findMany({
            select:{
                id:true,
                name:true,
            }
        });
        const levels = await prisma.levels.findMany({
            select:{
                id:true,
                name:true,
            }
        });
        const rooms = await prisma.rooms.findMany({
            select:{
                id:true,
                name:true,
            }
        });
        const data = {
            classrooms,
            education_years,
            education_terms,
            levels,
            rooms,
        };
        
        res.send(data).status(200);
    } catch (e) {
        console.error(e);
        res.status(500).send('Server Error');
    }
}

exports.getClassrooms = async (req,res) => {
    try {
        const { search, page = 1, pageSize = 10 } = req.query; 
        
        const pageNumber = parseInt(page);
        const size = parseInt(pageSize);
        
        const skip = (pageNumber - 1) * size;

        const searchFilter = search
            ? {
                OR: [
                    { level: { name: {contains: search} } },
                    { room: { name: {contains: search} } },
                    { education_year: { name: {contains: search} } },
                    { education_term: { name: {contains: search} } }
                ].filter(Boolean) 
            }
            : {};

        const [classrooms, totalRecords] = await Promise.all([
            prisma.classrooms.findMany({
                select:{
                    id:true,
                    level:{
                        select:{
                            id:true,
                            name:true,
                        }
                    },
                    room:{
                        select:{
                            id:true,
                            name:true,
                        }
                    },
                    education_year:{
                        select:{
                            id:true,
                            name:true,
                        }
                    },
                    education_term:{
                        select:{
                            id:true,
                            name:true,
                        }
                    },
                    createdAt:true,
                    updatedAt:true,
                },
                where: searchFilter,
                skip: skip,
                take: size,
            }),
            prisma.classrooms.count({
                where: searchFilter,
            }),
        ]);

        const totalPages = Math.ceil(totalRecords / size);

        res.status(200).json({
            data: classrooms,
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

exports.AddClassroom = async (req, res) => {
    try {
        const { education_year_id, education_term_id, level_id, room_id } = req.body;

        const requiredFields = {
            education_year_id: 'Education Year',
            education_term_id: 'Education Term',
            level_id: 'Level',
            room_id: 'Room'
        };

        const errorMessage = validateRequiredFields(req.body, requiredFields);

        if (errorMessage) {
            return res.status(400).json({ message: errorMessage, type: 'error' });
        }

        const [education_year, education_term, level, room] = await Promise.all([
            prisma.educationYears.findFirst({ where: { id: education_year_id }, select: { id: true, name: true } }),
            prisma.educationTerms.findFirst({ where: { id: education_term_id }, select: { id: true, name: true } }),
            prisma.levels.findFirst({ where: { id: level_id }, select: { id: true, name: true } }),
            prisma.rooms.findFirst({ where: { id: room_id }, select: { id: true, name: true } })
        ]);

        if (!education_year) {
            return res.status(200).json({ message: 'ไม่พบปีการศึกษา', type: 'error' });
        }
        if (!education_term) {
            return res.status(200).json({ message: 'ไม่พบภาคเรียน', type: 'error' });
        }
        if (!level) {
            return res.status(200).json({ message: 'ไม่พบระดับชั้น', type: 'error' });
        }
        if (!room) {
            return res.status(200).json({ message: 'ไม่พบห้อง', type: 'error' });
        }

        const checkClassroomExist = await prisma.classrooms.findFirst({
            where: {
                AND: [
                    { education_year_id: education_year.id },
                    { education_term_id: education_term.id },
                    { level_id: level.id },
                    { room_id: room.id },
                ],
            }
        });

        if(checkClassroomExist){
            return res.status(200).json({ message: 'มีห้องเรียนนี้ซ้ำในระบบแล้ว', type: 'error' });
        }

        await prisma.classrooms.create({
            data: {
                education_year_id: education_year.id,
                education_term_id: education_term.id,
                level_id: level.id,
                room_id: room.id
            }
        });

        res.status(201).json({
            message: `เพิ่มห้องเรียน ${level.name}/${room.name} ปีการศึกษา ${education_year.name} ภาคเรียนที่ ${education_term.name} เรียบร้อยแล้ว`,
            type: 'success'
        });

    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Server Error', error: e.message });
    }
};

exports.EditClassroom = async (req,res) => {
    try {
        const { id, education_year_id, education_term_id, level_id, room_id } = req.body;

        const requiredFields = {
            id: 'Id',
            education_year_id: 'Education Year',
            education_term_id: 'Education Term',
            level_id: 'Level',
            room_id: 'Room',
        };
    
        const errorMessage = validateRequiredFields(req.body, requiredFields);
    
        if (errorMessage) {
            return res.status(400).json({ message: errorMessage, type: 'error' });
        }
        
        const education_year = await prisma.educationYears.findFirst({
            select:{
                id:true,
                name:true,
            },
            where:{
                id:education_year_id
            }
        });
        const education_term = await prisma.educationTerms.findFirst({
            select:{
                id:true,
                name:true,
            },
            where:{
                id:education_term_id
            }
        });
        const level = await prisma.levels.findFirst({
            select:{
                id:true,
                name:true,
            },
            where:{
                id:level_id
            }
        });
        const room = await prisma.rooms.findFirst({
            select:{
                id:true,
                name:true,
            },
            where:{
                id:room_id
            }
        });
        const existingClassroom = await prisma.classrooms.findFirst({
            where: {
                AND: [
                    { education_year_id:education_year.id },
                    { education_term_id:education_term.id },
                    { level_id:level.id },
                    { room_id:room.id },
                ],
            },
        });

        if (existingClassroom) {
            return res.status(200).json({
                message: `ห้องเรียน ${level.name}/${room.name} ปีการศึกษา ${education_year.name} ภาคเรียนที่ ${education_term.name} มีซ้ำในระบบแล้ว`,
                type: 'error',
            });
        }

        await prisma.classrooms.update({
            where:{
                id:id
            },
            data:{
                education_year_id:education_year.id,
                education_term_id:education_term.id,
                level_id:level.id,
                room_id:room.id,
            }
        });
        res.json({message:`แก้ไขห้องเรียน ${level.name}/${room.name} ปีการศึกษา ${education_year.name} ภาคเรียนที่ ${education_term.name} เรียบร้อยแล้ว`,type:'success'}).status(204);
    } catch (e) {
        console.error(e);
        res.status(500).send('Server Error');
    }
}

exports.RemoveClassroom = async (req,res) => {
    try {
        const { id } = req.body;

        const requiredFields = {
            id: 'Id',
        };
    
        const errorMessage = validateRequiredFields(req.body, requiredFields);
    
        if (errorMessage) {
            return res.status(400).json({ message: errorMessage, type: 'error' });
        }

        const classroom = await prisma.classrooms.findFirst({
            select:{
                id:true,
                level:{
                    select:{
                        id:true,
                        name:true,
                    }
                },
                room:{
                    select:{
                        id:true,
                        name:true,
                    }
                },
                education_year:{
                    select:{
                        id:true,
                        name:true,
                    }
                },
                education_term:{
                    select:{
                        id:true,
                        name:true,
                    }
                },
                createdAt:true,
                updatedAt:true,
            },
            where:{
                id:id
            }
        })

        if(!classroom){
            return res.json({message:`ไม่สามารถลบได้ ไม่พบห้องเรียน`,type:'error'}).status(404);
        }

        await prisma.classrooms.delete({
            where:{
                id:classroom.id
            },
        });
        res.json({message:`ลบห้องเรียน ${classroom.level.name}/${classroom.room.name} ปีการศึกษา ${classroom.education_year.name} ภาคเรียนที่ ${classroom.education_term.name} เรียบร้อยแล้ว`,type:'success'}).status(204);
    } catch (e) {
        console.error(e);
        res.status(500).send('Server Error');
    }
}

