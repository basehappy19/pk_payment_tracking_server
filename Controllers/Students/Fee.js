const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const validateRequiredFields = require("../../Functions/validateRequiredFields");

exports.CheckFees = async (req,res) => {
    try {
        const { id } = req.student;
        
        if (!id) {
            return res.status(400).json({ message: 'การเข้าถึงถูกปฏิเสธ', type: 'error' });
        }

        const student = await prisma.students.findUnique({
            where: { sid: id }, 
            select: {
                sid:true,
                name:true,
                studentInClassroom: {
                    select: {
                        no:true,
                        pay_status:true,
                        classroom: {
                            select: {
                                level_id:true,
                                room_id:true,
                                education_year:{
                                    select:{
                                        name:true
                                    }
                                },
                                education_term:{
                                    select:{
                                        name:true
                                    }
                                },
                                feeForClassrooms:{
                                    select: {
                                        id: true,
                                        fee:{
                                            select:{
                                                id: false,
                                                amount: true,
                                                name: true,
                                            }
                                        },
                                    }
                                },
                            }
                        },
                    }
                },
            },
            
        });
        
        const totalFeeAmount = student.studentInClassroom.reduce((total, sic) => {
            const classroomFees = sic.classroom.feeForClassrooms;
            const totalFees = classroomFees.reduce((sum, feeForClassroom) => {
                return sum + Number(feeForClassroom.fee.amount); 
            }, 0);
            return total + totalFees;
        }, 0);
        
        const result = {
            ...student,
            total_fee_amount: totalFeeAmount
        };
        

        res.status(200).json(result);
    } catch (e) {
        console.error(e);
        res.status(500).send('Server Error');
    }
}

exports.CheckFeeAllStudent = async (req,res) => {
    try {
        if (req.user.roleId < 1) {
            return res.status(400).json({ message: 'การเข้าถึงถูกปฏิเสธ', type: 'error' });
        }
        const { education_year_id, education_term_id, level_id, room_id } = req.body;

        const requiredFields = {
            education_year_id: 'educationYear',
            education_term_id: 'educationTerm',
            level_id: 'Level',
            room_id: 'Room',
        };
    
        const errorMessage = validateRequiredFields(req.body, requiredFields);
        
        if (errorMessage) {
            return res.status(400).json({ message: errorMessage, type: 'error' });
        }

        const classroom = await prisma.classrooms.findFirst({
            where:{
                education_year_id, 
                education_term_id, 
                level_id, 
                room_id
            }
        })
        
        const classroomFees = await prisma.feeForClassroom.findMany({
            where:{
                classroom_id: classroom.id
            },
            select:{
                fee:{
                    select:{
                        amount:true,
                        name:true,
                    }
                },
            }
        })

        let students = [];
        if (req.user.roleId === 2 || req.user.roleId === 3) {
            students = await prisma.studentInClassroom.findMany({
                where: { classroom_id: classroom.id },
                select: {
                    student_sid: true,
                    student:{
                        select:{
                            name:true,
                        },
                    },
                    no: true,
                    pay_status: true,
                    studentReceipts:{
                        select:{
                            amount:true,
                            receiptBook:{
                                select:{
                                    name:true,
                                    total_page:true
                                }
                            }
                        }
                    },
                    classroom: {
                        select: {
                            level_id:true,
                            room_id:true,
                            education_year:{
                                select:{
                                    name:true
                                }
                            },
                            education_term:{
                                select:{
                                    name:true
                                }
                            },
                            feeForClassrooms:{
                                select: {
                                    id: true,
                                    fee:{
                                        select:{
                                            id: false,
                                            amount: true,
                                            name: true,
                                        }
                                    },
                                }
                            },
                        }
                    },
                }
            })
        } else if (req.user.roleId === 1) {
            students = await prisma.studentInClassroom.findMany({
                where: { classroom_id: classroom.id },
                select: {
                    student_sid: true,
                    student:{
                        select:{
                            name:true,
                        },
                    },
                    no: true,
                    pay_status: true,
                    classroom: {
                        select: {
                            level_id:true,
                            room_id:true,
                            education_year:{
                                select:{
                                    name:true
                                }
                            },
                            education_term:{
                                select:{
                                    name:true
                                }
                            },
                            feeForClassrooms:{
                                select: {
                                    id: true,
                                    fee:{
                                        select:{
                                            id: false,
                                            amount: true,
                                            name: true,
                                        }
                                    },
                                }
                            },
                        }
                    },
                }
            })
        }
        let classroomFeeWithTotalFee = {
            fees:[],
            total_fee_amount:0,
        }
        if (req.user.roleId === 2 || req.user.roleId === 3) {
            classroomFeeWithTotalFee = {
                fees: classroomFees,
                total_fee_amount: classroomFees.reduce((total, item) => {
                    return total + Number(item.fee.amount);
                }, 0),
                total_students: students.length,
                total_fee_for_all_students: students.reduce((sum, student) => {
                    const totalFeeAmount = student.classroom.feeForClassrooms.reduce(
                        (total, feeForClassroom) => total + Number(feeForClassroom.fee.amount),
                        0
                    );
                    return sum + totalFeeAmount;
                }, 0),
                total_paid_by_all_students: students.reduce((sum, student) => {
                    const totalPaid = student.studentReceipts.reduce(
                        (receiptSum, receipt) => receiptSum + Number(receipt.amount),
                        0
                    );
                    return sum + totalPaid;
                }, 0),
                remaining_amount: students.reduce((sum, student) => {
                    const totalFeeAmount = student.classroom.feeForClassrooms.reduce(
                        (total, feeForClassroom) => total + Number(feeForClassroom.fee.amount),
                        0
                    );
                    const totalPaid = student.studentReceipts.reduce(
                        (receiptSum, receipt) => receiptSum + Number(receipt.amount),
                        0
                    );
                    return sum + (totalFeeAmount - totalPaid);
                }, 0),
            };   
        } else if (req.user.roleId === 1) {
            classroomFeeWithTotalFee = {
                fees: classroomFees,
                total_students: students.length,
                total_fee_amount: classroomFees.reduce((total, item) => {
                    return total + Number(item.fee.amount);
                }, 0),
            };     
        }

        let studentsWithTotalFee = [];
        if (req.user.roleId === 2 || req.user.roleId === 3) {
            studentsWithTotalFee = students.map((student) => {
                const totalFeeAmount = student.classroom.feeForClassrooms.reduce(
                    (total, feeForClassroom) => total + Number(feeForClassroom.fee.amount),
                    0
                );

                const totalPaid = student.studentReceipts.reduce(
                    (sum, receipt) => sum + Number(receipt.amount),
                    0
                );

                return {
                    ...student,
                    total_fee_amount: totalFeeAmount,
                    total_paid_amount: totalPaid,
                };
            });
        } else if (req.user.roleId === 1) {
            studentsWithTotalFee = students.map(student => {
                const totalFeeAmount = student.classroom.feeForClassrooms.reduce((total, feeForClassroom) => {
                    return total + Number(feeForClassroom.fee.amount); 
                }, 0);
              
                return {
                    ...student,
                    total_fee_amount: totalFeeAmount
                };
            });
        }
          
        res.status(200).send({students:studentsWithTotalFee,classroom:classroomFeeWithTotalFee});
    } catch (e) {
        console.error(e);
        res.status(500).send('Server Error');
    }
}