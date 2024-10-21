const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const validateRequiredFields = require("../../Functions/validateRequiredFields");

exports.getStudentReceipts = async (req,res) => {
    try {
        const { search, page = 1, pageSize = 10 } = req.query; 
        
        const pageNumber = parseInt(page);
        const size = parseInt(pageSize);
        
        const skip = (pageNumber - 1) * size;

        const searchFilter = search
            ? {
                OR: [
                    { studentInClassroom: { student_sid: isNaN(parseInt(search)) ? undefined : parseInt(search) } },
                    { studentInClassroom: { student: { sid: isNaN(parseInt(search)) ? undefined : parseInt(search) } } },
                    { studentInClassroom: { student: { cid: { contains: search } } } },
                    { studentInClassroom: { student: { name: { contains: search }} } },
                    { studentInClassroom: { classroom: { education_year : { name: {contains: search} } } } },
                    { studentInClassroom: { classroom: { education_term : { name: {contains: search} } } } },
                    { studentInClassroom: { classroom: { level : { name: {contains: search} } } } },
                    { studentInClassroom: { classroom: { room : { name: {contains: search} } } } },
                    { studentInClassroom: { no: isNaN(parseInt(search)) ? undefined : parseInt(search) } },
                    { amount: isNaN(parseInt(search)) ? undefined : parseInt(search) },
                    { receiptBook: { name: { contains: search } }},
                    { receiptBook: { total_page: isNaN(parseInt(search)) ? undefined : parseInt(search) }},
                ].filter(Boolean) 
            }
            : {};

        const [studentReceipts, totalRecords] = await Promise.all([
            prisma.studentReceipt.findMany({
                select:{
                    id:true,
                    studentInClassroom:{
                        select:{
                            id:true,
                            student_sid:true,
                            student:{
                                select:{
                                    sid:true,
                                    cid:true,
                                    name:true,
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
                            no:true,
                        }
                    },
                    amount:true,
                    receiptBook:{
                        select:{
                            id:true,
                            name:true,
                            total_page:true,
                        }
                    },
                    createdAt:true,
                    updatedAt:true,
                },
                where: searchFilter,
                skip: skip,
                take: size,
            }),
            prisma.studentReceipt.count({
                where: searchFilter,
            }),
        ]);

        const totalPages = Math.ceil(totalRecords / size);

        res.status(200).json({
            data: studentReceipts,
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

exports.AddStudentReceipt = async (req, res) => {
    try {
        const { student_sid, amount, receipt_book_id } = req.body;
        
        const requiredFields = {
            student_sid: 'Student Id',
            amount: 'Amount',
            receipt_book_id: 'Receipt Book Id',
        };

        const errorMessage = validateRequiredFields(req.body, requiredFields);

        if (errorMessage) {
            return res.status(400).json({ message: errorMessage, type: 'error' });
        }

        const [studentInClassroom, receiptBook] = await Promise.all([
            prisma.studentInClassroom.findFirst({ where: { student_sid: student_sid }, select: { id:true,student_sid:true }}),
            prisma.receiptBooks.findFirst({ where: { id: receipt_book_id }, select: { id: true, name: true, total_page: true } })
        ]);

        if (!studentInClassroom) {
            return res.status(200).json({ message: 'ไม่พบนักเรียน', type: 'error' });
        }
        if (!receiptBook) {
            return res.status(200).json({ message: 'ไม่พบเล่มใบเสร็จ', type: 'error' });
        }

        await prisma.studentReceipt.create({
            data: {
                student_in_classroom_id: studentInClassroom.id,
                amount: amount,
                receipt_book_id: receiptBook.id
            }
        });
        
        res.status(201).json({
            message: `เพื่มใบเสร็จนักเรียน ${studentInClassroom.student_sid} จำนวน ${amount} บาท ในเล่มใบเสร็จ ${receiptBook.name} เรียบร้อยแล้ว`,
            type: 'success'
        });

    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Server Error', error: e.message });
    }
};

exports.EditStudentReceipt = async (req,res) => {
    try {
        const { id, student_sid, amount, receipt_book_id } = req.body;
        
        const requiredFields = {
            id: 'Id',
            student_sid: 'Student Id',
            amount: 'Amount',
            receipt_book_id: 'Receipt Book Id',
        };
    
        const errorMessage = validateRequiredFields(req.body, requiredFields);
    
        if (errorMessage) {
            return res.status(400).json({ message: errorMessage, type: 'error' });
        }
        
        const [studentInClassroom, receiptBook] = await Promise.all([
            prisma.studentInClassroom.findFirst({ where: { student_sid: student_sid }, select: { 
                id:true,
                student_sid:true,
                student: {
                select:{
                    sid:true,
                    cid:true,
                    name:true,
                }
            }}}),
            prisma.receiptBooks.findFirst({ where: { id: receipt_book_id }, select: { id: true, name: true, total_page: true } })
        ]);

        if (!studentInClassroom) {
            return res.status(200).json({ message: 'ไม่พบนักเรียน', type: 'error' });
        }
        if (!receiptBook) {
            return res.status(200).json({ message: 'ไม่พบเล่มใบเสร็จ', type: 'error' });
        }

        await prisma.studentReceipt.update({
            where:{
                id:id
            },
            data:{
                student_in_classroom_id:studentInClassroom.id,
                amount:amount,
                receipt_book_id:receiptBook.id,
            }
        });
        res.json({message:`แก้ไขใบเสร็จนักเรียน ${studentInClassroom.student_sid} จำนวน ${amount} บาท ในเล่มใบเสร็จ ${receiptBook.name} เรียบร้อยแล้ว`,type:'success'}).status(204);
    } catch (e) {
        console.error(e);
        res.status(500).send('Server Error');
    }
}

exports.RemoveStudentReceipt = async (req,res) => {
    try {
        const { id } = req.body;

        const requiredFields = {
            id: 'Id',
        };
    
        const errorMessage = validateRequiredFields(req.body, requiredFields);
    
        if (errorMessage) {
            return res.status(400).json({ message: errorMessage, type: 'error' });
        }

        const studentReceipt = await prisma.studentReceipt.findFirst({
            select:{
                id:true,
                studentInClassroom:{
                    select:{
                        id:true,
                        student_sid:true,
                        student:{
                            select:{
                                sid:true,
                                cid:true,
                                name:true,
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
                        no:true,
                    }
                },
                amount:true,
                receiptBook:{
                    select:{
                        id:true,
                        name:true,
                        total_page:true,
                    }
                },
                createdAt:true,
                updatedAt:true,
            },
            where:{
                id:id
            }
        })

        if(!studentReceipt){
            return res.json({message:`ไม่สามารถลบได้ ไม่พบใบเสร็จนักเรียน`,type:'error'}).status(404);
        }

        await prisma.studentReceipt.delete({
            where:{
                id:studentReceipt.id
            },
        });
        res.json({message:`ลบใบเสร็จนักเรียน ${studentReceipt.studentInClassroom.student_sid} จำนวน ${studentReceipt.amount} บาท ในเล่มใบเสร็จ ${studentReceipt.receiptBook.name} เรียบร้อยแล้ว`,type:'success'}).status(204);
    } catch (e) {
        console.error(e);
        res.status(500).send('Server Error');
    }
}
