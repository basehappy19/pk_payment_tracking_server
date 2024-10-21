const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const validateRequiredFields = require("../../Functions/validateRequiredFields");

exports.getFeeForClassrooms = async (req,res) => {
    try {
        const { search, page = 1, pageSize = 10 } = req.query; 
        
        const pageNumber = parseInt(page);
        const size = parseInt(pageSize);
        
        const skip = (pageNumber - 1) * size;

        const searchFilter = search
            ? {
                OR: [
                    { fee: { amount: isNaN(parseInt(search)) ? undefined : parseInt(search) } },
                    { fee: { name: {contains: search} } },
                    { fee: { education_year: { name: {contains: search}} } },
                    { fee: { education_term: { name: {contains: search}} } },
                    { classroom: { education_year: { name: {contains: search}} } },
                    { classroom: { education_term: { name: {contains: search}} } },
                    { classroom: { level: { name: {contains: search}} } },
                    { classroom: { room: { name: {contains: search}} } },
                ].filter(Boolean) 
            }
            : {};

        const [feeForClassrooms, totalRecords] = await Promise.all([
            prisma.feeForClassroom.findMany({
                select:{
                    id:true,
                    fee:{
                        select:{
                            id:true,
                            amount:true,
                            name:true,
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
                        }
                    },
                    classroom:{
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
                    },
                    createdAt:true,
                    updatedAt:true,
                },
                where: searchFilter,
                skip: skip,
                take: size,
            }),
            prisma.feeForClassroom.count({
                where: searchFilter,
            }),
        ]);

        const totalPages = Math.ceil(totalRecords / size);

        res.status(200).json({
            data: feeForClassrooms,
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

exports.AddFeeForClassroom = async (req, res) => {
    try {
        const { fee_id, classroom_id } = req.body;

        const requiredFields = {
            fee_id: 'Fee Id',
            classroom_id: 'Classroom Id',
        };

        const errorMessage = validateRequiredFields(req.body, requiredFields);

        if (errorMessage) {
            return res.status(400).json({ message: errorMessage, type: 'error' });
        }

        const [fee, classroom] = await Promise.all([
            prisma.fees.findFirst({ select: { id: true, amount:true, name:true }, where: { id: fee_id } }),
            prisma.classrooms.findFirst({ select: {
                id: true,
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
            },
            where: { id: classroom_id }, 
            }),
        ]);

        if (!fee) {
            return res.status(200).json({ message: 'ไม่พบค่าธรรมเนียม', type: 'error' });
        }
        if (!classroom) {
            return res.status(200).json({ message: 'ไม่พบห้องเรียน', type: 'error' });
        }

        const checkFeeForClassroomExist = await prisma.feeForClassroom.findFirst({
            where: {
                AND: [
                    { fee_id: fee.id },
                    { classroom_id: classroom.id },
                ],
            }
        });

        if(checkFeeForClassroomExist){
            return res.status(200).json({ message: 'มีค่าธรรมเนียมในห้องนี้ซ้ำแล้ว', type: 'error' });
        }

        await prisma.feeForClassroom.create({
            data: {
                fee_id: fee.id,
                classroom_id: classroom.id,
            }
        });

        res.status(201).json({
            message: `เพิ่มค่าธรรมเนียม ${fee.name} สำหรับห้อง ${classroom.level.name}/${classroom.room.name} ปีการศึกษา ${classroom.education_year.name} ภาคเรียนที่ ${classroom.education_term.name} เรียบร้อยแล้ว`,
            type: 'success'
        });

    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Server Error', error: e.message });
    }
};

exports.EditFeeForClassroom = async (req,res) => {
    try {
        const { id, fee_id, classroom_id } = req.body;

        const requiredFields = {
            id: 'Id',
            fee_id: 'Fee Id',
            classroom_id: 'Classroom Id',
        };
    
        const errorMessage = validateRequiredFields(req.body, requiredFields);
    
        if (errorMessage) {
            return res.status(400).json({ message: errorMessage, type: 'error' });
        }
        
        const fee = await prisma.fees.findFirst({
            select:{
                id:true,
                amount:true,
                name:true,
            },
            where:{
                id:fee_id
            }
        });
        const classroom = await prisma.classrooms.findFirst({
            select:{
                id: true,
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
            },
            where:{
                id:classroom_id
            }
        });

        const existingFeeForClassroom = await prisma.feeForClassroom.findFirst({
            where: {
                AND: [
                    { fee_id:fee.id },
                    { classroom_id:classroom.id },
                ],
            },
        });

        if (existingFeeForClassroom) {
            return res.status(200).json({
                message: `ค่าธรรมเนียม ${fee.name} สำหรับห้อง ${classroom.level.name}/${classroom.room.name} ปีการศึกษา ${classroom.education_year.name} ภาคเรียนที่ ${classroom.education_term.name} มีซ้ำในระบบแล้ว`,
                type: 'error',
            });
        }

        await prisma.feeForClassroom.update({
            where:{
                id:id
            },
            data:{
                fee_id:fee.id,
                classroom_id:classroom.id,
            }
        });
        res.json({message:`แก้ไขค่าธรรมเนียม ${fee.name} สำหรับห้อง ${classroom.level.name}/${classroom.room.name} ปีการศึกษา ${classroom.education_year.name} ภาคเรียนที่ ${classroom.education_term.name} เรียบร้อยแล้ว`,type:'success'}).status(204);
    } catch (e) {
        console.error(e);
        res.status(500).send('Server Error');
    }
}

exports.RemoveFeeForClassroom = async (req,res) => {
    try {
        const { id } = req.body;

        const requiredFields = {
            id: 'Id',
        };
    
        const errorMessage = validateRequiredFields(req.body, requiredFields);
    
        if (errorMessage) {
            return res.status(400).json({ message: errorMessage, type: 'error' });
        }

        const feeForClassroom = await prisma.feeForClassroom.findFirst({
            select:{
                id:true,
                fee:{
                    select:{
                        id:true,
                        amount:true,
                        name:true,
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
                    }
                },
                classroom:{
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
                },
                createdAt:true,
                updatedAt:true,
            },
            where:{
                id:id
            }
        })

        if(!feeForClassroom){
            return res.json({message:`ไม่สามารถลบได้ ไม่พบค่าธรรมสำหรับห้องเรียนนี้`,type:'error'}).status(404);
        }

        await prisma.feeForClassroom.delete({
            where:{
                id:feeForClassroom.id
            },
        });
        res.json({message:`ลบค่าธรรมเนียม ${feeForClassroom.fee.name} สำหรับห้อง ${feeForClassroom.classroom.level.name}/${feeForClassroom.classroom.room.name} ปีการศึกษา ${feeForClassroom.classroom.education_year.name} ภาคเรียนที่ ${feeForClassroom.classroom.education_term.name} เรียบร้อยแล้ว`,type:'success'}).status(204);
    } catch (e) {
        console.error(e);
        res.status(500).send('Server Error');
    }
}
