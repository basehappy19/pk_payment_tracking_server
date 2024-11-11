const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const ValidateRequiredFields = require("../../Functions/ValidateRequiredFields");

exports.getStudents = async (req,res) => {
    try {
        const { search, page = 1, pageSize = 100 } = req.query; 
        
        const pageNumber = parseInt(page);
        const size = parseInt(pageSize);
        
        const skip = (pageNumber - 1) * size;

        const searchFilter = search
            ? {
                OR: [
                    { sid: isNaN(parseInt(search)) ? undefined : parseInt(search) },
                    { cid: { contains: search } },
                    { name: { contains: search } }
                ].filter(Boolean) 
            }
            : {};

        const [students, totalRecords] = await Promise.all([
            prisma.students.findMany({
                where: searchFilter,
                skip: skip,
                take: size,
            }),
            prisma.students.count({
                where: searchFilter,
            }),
        ]);

        const totalPages = Math.ceil(totalRecords / size);

        res.status(200).json({
            data: students,
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

exports.AddStudent = async (req,res) => {
    try {
        const { sid, cid, name } = req.body;
        const requiredFields = {
            sid: 'Student Id',
            cid: 'Citizen Id',
            name: 'Name',
        }

        const errorMessage = ValidateRequiredFields(req.body, requiredFields);

        const existingStudent = await prisma.students.findFirst({
            where: {
                OR: [
                    { sid: sid },
                    { cid: cid },
                ],
            },
        });

        if (existingStudent) {
            let duplicateField = existingStudent.sid === sid ? 'รหัสนักเรียน' : 'เลขบัตรประชาชน';
            return res.status(200).json({
                message: `${duplicateField} ${duplicateField === 'รหัสนักเรียน' ? sid : cid} มีซ้ำในระบบแล้ว`,
                type: 'error',
            });
        }

        if (errorMessage) {
            return res.status(400).json({ message: errorMessage, type: 'error' });
        };
        await prisma.students.create({data:{sid, cid, name}});
        res.json({message:`เพิ่ม ${name} เลขประจำตัว ${sid} ในรายชื่อนักเรียนเรียบร้อยแล้ว`,type:'success'}).status(201);
    } catch (e) {
        console.error(e);
        res.status(500).sent('Server Error');
    }
}

exports.EditStudent = async (req,res) => {
    try {
        const { sid, cid, name } = req.body;

        const requiredFields = {
            sid: 'Student Id',
        };
    
        const errorMessage = ValidateRequiredFields(req.body, requiredFields);
    
        if (errorMessage) {
            return res.status(400).json({ message: errorMessage, type: 'error' });
        }

        const existingStudent = await prisma.students.findFirst({
            where: {
                AND: [
                    { sid: sid },
                    { cid: cid },
                    { name: name },
                ],
            },
        });

        if (existingStudent) {
            return res.status(200).json({
                message: `รหัสนักเรียน ${sid} เลขบัตรประชาชน ${cid} มีซ้ำในระบบแล้ว`,
                type: 'error',
            });
        }

        await prisma.students.update({
            data:{
                cid:cid,
                name:name
            },
            where:{
                sid:sid
            },
        });
        res.json({message:`แก้ไขนักเรียน ${name} รหัสนักเรียน ${sid} เลขบัตรประชาชน ${cid} เรียบร้อยแล้ว`,type:'success'}).status(204);
    } catch (e) {
        console.error(e);
        res.status(500).send('Server Error');
    }
}

exports.RemoveStudent = async (req,res) => {
    try {
        const { sid } = req.body;

        const requiredFields = {
            sid: 'Student Id',
        };
    
        const errorMessage = ValidateRequiredFields(req.body, requiredFields);
    
        if (errorMessage) {
            return res.status(400).json({ message: errorMessage, type: 'error' });
        }
        const student = await prisma.students.findFirst({
            where:{
                sid:sid
            }
        })

        if(!student){
            return res.json({message:`ไม่สามารถลบได้ ไม่พบนักเรียน`,type:'error'}).status(200);
        }

        await prisma.students.delete({
            where:{
                sid:student.sid
            },
        });
        res.json({message:`ลบนักเรียน ${student.name} รหัสนักเรียน ${student.sid} เลขบัตรประชาชน ${student.cid} เรียบร้อยแล้ว`,type:'success'}).status(204);
    } catch (e) {
        console.error(e);
        res.status(500).send('Server Error');
    }
}

exports.getStudentInClassrooms = async (req,res) => {
    try {
        const { search, status, page = 1, pageSize = 100 } = req.query; 
        
        const pageNumber = parseInt(page);
        const size = parseInt(pageSize);
        
        const skip = (pageNumber - 1) * size;
        
        const searchFilter = {
            AND: [
              status ? { pay_status: status } : {},
              {
                OR: [
                  { student_sid: isNaN(parseInt(search)) ? undefined : parseInt(search) },
                  { classroom: { education_year: { name: { contains: search || undefined } } } },
                  { classroom: { education_term: { name: { contains: search || undefined } } } },
                  { classroom: { level: { name: { contains: search || undefined } } } },
                  { classroom: { room: { name: { contains: search || undefined } } } },
                  { no: isNaN(parseInt(search)) ? undefined : parseInt(search) },
                ].filter(Boolean), 
              },
            ].filter((condition) => Object.keys(condition).length > 0),
          };
          

        const [students, totalRecords] = await Promise.all([
            prisma.studentInClassroom.findMany({
                select:{
                    id:true,
                    student_sid:true,
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
                    no:true,
                    pay_status:true,
                    createdAt:true,
                    updatedAt:true,
                },
                where: searchFilter,
                skip: skip, 
                take: size,  
            }),
            prisma.studentInClassroom.count({
                where: searchFilter
            }),
        ]);

        const totalPages = Math.ceil(totalRecords / size);

        res.status(200).json({
            data: students,
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

exports.AddStudentInClassroom = async (req,res) => {
    try {
        const { student_sid, classroom_id, no, pay_status } = req.body;
        const requiredFields = {
            student_sid: 'Student Id',
            classroom_id: 'Classroom Id',
            no: 'Student Number',
            pay_status: 'Pay Status',
        }

        const errorMessage = ValidateRequiredFields(req.body, requiredFields);

        if (errorMessage) {
            return res.status(400).json({ message: errorMessage, type: 'error' });
        };

        const student = await prisma.students.findFirst({
            select:{
                sid:true,
                cid:true,
                name:true,
            },
            where:{
                sid:student_sid
            }
        })

        if(!student){
            return res.status(200).json({ message: 'ไม่สามารถเพิ่มนักเรียนเข้าห้องเรียนได้ ไม่พบนักเรียน', type: 'error' });
        }

        const classroom = await prisma.classrooms.findFirst({
            select:{
                id:true,
                education_year:{
                    select:{
                        name:true
                    },
                },
                education_term:{
                    select:{
                        name:true
                    },
                },
                level:{
                    select:{
                        name:true
                    },
                },
                room:{
                    select:{
                        name:true
                    },
                },
            },
            where:{
                id:classroom_id
            }
        })

        if(!classroom){
            return res.status(200).json({ message: 'ไม่สามารถเพิ่มนักเรียนเข้าห้องเรียนได้ ไม่พบห้องเรียน', type: 'error' });
        }

        const existingStudentInClassroom = await prisma.studentInClassroom.findFirst({
            where: {
                AND: [
                    { student_sid: student.sid },
                    { classroom_id: classroom.id },
                    { no: no },
                    { pay_status: pay_status },
                ],
            },
        });

        if (existingStudentInClassroom) {
            return res.status(200).json({
                message: `นักเรียน ${student.sid} เลขที่ ${no} ในห้อง ${classroom.level.name}/${classroom.room.name} ปีการศึกษา ${classroom.education_year.name} ภาคเรียนที่ ${classroom.education_term.name} มีซ้ำในระบบแล้ว`,
                type: 'error',
            });
        }

        await prisma.studentInClassroom.create({data:{student_sid, classroom_id, no, pay_status}});
        res.json({message:`เพิ่มนักเรียน ${student.sid} เลขที่ ${no} ในห้อง ${classroom.level.name}/${classroom.room.name} ปีการศึกษา ${classroom.education_year.name} ภาคเรียนที่ ${classroom.education_term.name} เรียบร้อย` ,type:'success'}).status(201);
    } catch (e) {
        console.error(e);
        res.status(500).sent('Server Error');
    }
}

exports.EditStudentInClassroom = async (req,res) => {
    try {
        const { id, student_sid, classroom_id, no, pay_status } = req.body;

        const requiredFields = {
            id: 'Id',
            student_sid: 'Student Id', 
            classroom_id: 'Classroom Id', 
            no: 'No', 
            pay_status: 'Pay Status'
        };
    
        const errorMessage = ValidateRequiredFields(req.body, requiredFields);
    
        if (errorMessage) {
            return res.status(400).json({ message: errorMessage, type: 'error' });
        }

        const student = await prisma.students.findFirst({
            select:{
                sid:true,
                cid:true,
                name:true,
            },
            where:{
                sid:student_sid
            }
        })

        if(!student){
            return res.json({message:`ไม่สามารถแก้ไขนักเรียนในห้องได้ ไม่พบนักเรียน`,type:'error'}).status(200);
        }

        const classroom = await prisma.classrooms.findFirst({
            select:{
                id:true,
                education_year:{
                    select:{
                        name:true
                    },
                },
                education_term:{
                    select:{
                        name:true
                    },
                },
                level:{
                    select:{
                        name:true
                    },
                },
                room:{
                    select:{
                        name:true
                    },
                },
            },
            where:{
                id:classroom_id
            }
        })

        if(!classroom){
            return res.status(200).json({ message: 'ไม่สามารถแก้ไขนักเรียนในห้องได้ ไม่พบห้องเรียน', type: 'error' });
        }

        const existingStudentInClassroom = await prisma.studentInClassroom.findFirst({
            where: {
                AND: [
                    { student_sid: student.sid },
                    { classroom_id: classroom.id },
                    { no: no },
                    { pay_status: pay_status }
                ],
            },
        });
        
        if (existingStudentInClassroom) {
            return res.status(200).json({
                message: `นักเรียน ${student.sid} เลขที่ ${no} ในห้อง ${classroom.level.name}/${classroom.room.name} ปีการศึกษา ${classroom.education_year.name} ภาคเรียนที่ ${classroom.education_term.name} มีซ้ำในระบบแล้ว`,
                type: 'error',
            });
        }
        await prisma.studentInClassroom.update({
            data:{
                student_sid:student.sid,
                classroom_id:classroom.id,
                no:no,
                pay_status:pay_status,
            },
            where:{
                id:id
            },
        });

        res.json({message:`แก้ไขรหัสนักเรียน ${student_sid} ในห้อง ${classroom.level.name}/${classroom.room.name} ปีการศึกษา ${classroom.education_year.name} ภาคเรียนที่ ${classroom.education_term.name} เรียบร้อยแล้ว`,type:'success'}).status(204);
    } catch (e) {
        console.error(e);
        res.status(500).send('Server Error');
    }
}

exports.RemoveStudentInClassroom = async (req,res) => {
    try {
        const { id } = req.body;

        const requiredFields = {
            id: 'Id',
        };
    
        const errorMessage = ValidateRequiredFields(req.body, requiredFields);
    
        if (errorMessage) {
            return res.status(400).json({ message: errorMessage, type: 'error' });
        }
        const student = await prisma.studentInClassroom.findFirst({
            where:{
                id:id
            }
        })

        if(!student){
            return res.json({message:`ไม่สามารถลบนักเรียนในห้องเรียนได้ ไม่พบนักเรียน`,type:'error'}).status(404);
        }

        const classroom = await prisma.classrooms.findFirst({
            select:{
                id:true,
                education_year:{
                    select:{
                        name:true,
                    }
                },
                education_term:{
                    select:{
                        name:true,
                    }
                },
                level:{
                    select:{
                        name:true
                    },
                },
                room:{
                    select:{
                        name:true
                    },
                },
            },
            where:{
                id:student.classroom_id
            }
        })

        await prisma.studentInClassroom.delete({
            where:{
                id:student.id
            },
        });


        res.json({message:`ลบนักเรียน ${student.student_sid} ออกจากห้อง ${classroom.level.name}/${classroom.room.name} ปีการศึกษา ${classroom.education_year.name} ภาคเรียนที่ ${classroom.education_term.name} เรียบร้อยแล้ว`,type:'success'}).status(204);
    } catch (e) {
        console.error(e);
        res.status(500).send('Server Error');
    }
}

