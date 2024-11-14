const { PrismaClient } = require('@prisma/client');
const ValidateRequiredFields = require('../Functions/ValidateRequiredFields');
const prisma = new PrismaClient();

exports.getImportOptions = async (req,res) => {
    try {
        if(req.user.roleId < 1){
            return res.status(401).json({ message: 'คุณไม่มีสิทธิ์เข้าถึง', type: 'error' });
        }
        const levels = await prisma.levels.findMany({
            orderBy: {
                id: 'asc'
            },
            select:{
                id:true,
                name:true,
            }
        });
        const rooms = await prisma.rooms.findMany({
            orderBy: {
                id: 'asc'
            },
            select:{
                id:true,
                name:true,
            }
        });
        const education_years = await prisma.educationYears.findMany({
            orderBy: {
                id: 'desc'
            },
            select:{
                id:true,
                name:true,
            }
        });
        const education_terms = await prisma.educationTerms.findMany({
            orderBy: {
                id: 'asc'
            },
            select:{
                id:true,
                name:true,
            }
        });
        const receiptBooks = await prisma.receiptBooks.findMany({
            select:{
                id:true,
                name:true,
                total_page: true,
            }
        });
        
        const data = {
            levels,
            rooms,
            education_years,
            education_terms,
            receiptBooks,
        };
        
        res.send(data).status(200);
    } catch (e) {
        console.error(e);
        res.status(500).send('Server Error');
    }
}

exports.AddImportData = async (req, res) => {
    try {
        const { student_id, classroom, student_name, education_year_term, receipt_book_name, receipt_no, amount } = req.body;

        const requiredFields = {
            student_id: 'Student Id',
            classroom: 'Classroom',
            student_name: 'Student Name',
            education_year_term: 'Education Year Term',
            receipt_book_name: 'Receipt Book Name',
            receipt_no: 'Receipt No',
        };

        const errorMessage = ValidateRequiredFields(req.body, requiredFields);
    
        if (errorMessage) {
            return res.status(400).json({ message: errorMessage, type: 'error' });
        }

    

    } catch (e) {
        console.log(e);
        res.status(500).send('Server Error');
    }
}

exports.AddImportDataByCSV = async (req, res) => {
    try {
        const { data } = req.body;

        if (!Array.isArray(data)) {
            return res.status(400).send('Invalid data format, expected an array');
        }

        let dataCount = 0;

        for (const item of data) {
            const { 
                student_id, cid, student_no, classroom, student_name, education_year_term, 
                receipt_book_name, receipt_no, amount 
            } = item;

            const [education_term, education_year] = education_year_term.split('/');
            const [level, room] = classroom.split('/');

            const term = await prisma.educationTerms.upsert({
                where: { name: education_term },
                create: { name: education_term },
                update: {}
            });

            const year = await prisma.educationYears.upsert({
                where: { name: education_year },
                create: { name: education_year },
                update: {}
            });

            const classroomLevel = await prisma.levels.upsert({
                where: { name: level },
                create: { name: level },
                update: {}
            });

            const classroomRoom = await prisma.rooms.upsert({
                where: { name: room },
                create: { name: room },
                update: {}
            });

            const classroomData = await prisma.classrooms.upsert({
                where: {
                    education_year_id_education_term_id_level_id_room_id: {
                        education_year_id: parseInt(year.id),
                        education_term_id: parseInt(term.id),
                        level_id: parseInt(classroomLevel.id),
                        room_id: parseInt(classroomRoom.id)
                    }
                },
                create: {
                    education_year_id: parseInt(year.id),
                    education_term_id: parseInt(term.id),
                    level_id: parseInt(classroomLevel.id),
                    room_id: parseInt(classroomRoom.id)
                },
                update: {}
            });

            const student = await prisma.students.upsert({
                where: { sid: parseInt(student_id) },
                create: { sid: parseInt(student_id), cid: cid, name: student_name },
                update: {}
            });

            const studentInClassroom = await prisma.studentInClassroom.upsert({
                where: {
                    student_sid_classroom_id: {
                        student_sid: parseInt(student.sid),
                        classroom_id: parseInt(classroomData.id)
                    }
                },
                create: {
                    student_sid: parseInt(student.sid),
                    classroom_id: parseInt(classroomData.id),
                    no: parseInt(student_no)
                },
                update: {}
            });

            const receiptBook = await prisma.receiptBooks.upsert({
                where: { name: receipt_book_name },
                create: { name: receipt_book_name, total_page: 0 },
                update: {}
            });

            await prisma.studentReceipt.create({
                data: {
                    student_in_classroom_id: parseInt(studentInClassroom.id),
                    receipt_book_id: parseInt(receiptBook.id),
                    receipt_no: parseInt(receipt_no),
                    amount: parseInt(amount)
                }
            });

            dataCount++;
        }

        res.status(201).json({
            message: `เพิ่มข้อมูลเรียบร้อยทั้งสิ้น ${dataCount} ข้อมูล`,
            type: 'success'
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

