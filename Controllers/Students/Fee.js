const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const ValidateRequiredFields = require("../../Functions/ValidateRequiredFields");


exports.CheckFees = async (req, res) => {
    try {
        const { id } = req.student;

        if (!id) {
            return res.status(400).json({ message: 'การเข้าถึงถูกปฏิเสธ', type: 'error' });
        }

        const { index = 0 } = req.query;
        const parsedIndex = parseInt(index, 10);

        const student = await prisma.students.findUnique({
            where: { sid: id },
            select: {
                sid: true,
                name: true,
                profileImg: true,
                studentInClassroom: {
                    orderBy: {
                        createdAt: 'desc'
                    },
                    select: {
                        id: true,
                        no: true,
                        pay_status: true,
                        classroom: {
                            select: {
                                level: { select: { name: true } },
                                room: { select: { name: true } },
                                education_year: { select: { name: true } },
                                education_term: { select: { name: true } },
                                feeForClassrooms: {
                                    select: {
                                        id: true,
                                        fee: { select: { amount: true, name: true } }
                                    }
                                },
                            }
                        },
                        createdAt: true,
                        updatedAt: true,
                    }
                },
            },
        });

        if (!student || !student.studentInClassroom.length) {
            return res.status(404).json({ message: 'ไม่พบข้อมูลนักเรียนในห้องเรียน', type: 'error' });
        }

        const studentInClassrooms = await prisma.studentInClassroom.findMany({
            where: {
                student_sid: student.sid,
            },
            orderBy: {
                createdAt: 'desc'
            },
            select: {
                id: true,
                no: true,
                pay_status: true,
                classroom: {
                    select: {
                        level: { select: { name: true } },
                        room: { select: { name: true } },
                        education_year: { select: { name: true } },
                        education_term: { select: { name: true } },
                        feeForClassrooms: {
                            select: {
                                id: true,
                                fee: { select: { amount: true, name: true } }
                            }
                        },
                    }
                },
                createdAt: true,
                updatedAt: true,
            }
        });

        const selectedIndex = Math.min(Math.max(parsedIndex, 0), studentInClassrooms.length - 1);
        const selectedStudentInClassroom = studentInClassrooms[selectedIndex];
        
        const classroomFees = selectedStudentInClassroom.classroom.feeForClassrooms;
        const totalFees = classroomFees.reduce((sum, feeForClassroom) => {
            return sum + Number(feeForClassroom.fee.amount);
        }, 0);
        
        selectedStudentInClassroom.total_fee_amount = totalFees;

        const enrichedStudentInClassrooms = studentInClassrooms.map((sic, idx) => {
            const classroomFees = sic.classroom.feeForClassrooms;
            const totalAmount = classroomFees.reduce((sum, feeForClassroom) => {
                return sum + Number(feeForClassroom.fee.amount);
            }, 0);

            return {
                ...sic,
                total_fee_amount: totalAmount
            };
        });

        const result = {
            ...student,
            studentInClassroom: selectedStudentInClassroom,
            studentInClassrooms: enrichedStudentInClassrooms,
            pagination: {
                next: {
                    data: selectedIndex < studentInClassrooms.length - 1 ? studentInClassrooms[selectedIndex + 1] : null,
                    index: selectedIndex < studentInClassrooms.length - 1 ? selectedIndex + 1 : null
                },
                prev: {
                    data: selectedIndex > 0 ? studentInClassrooms[selectedIndex - 1] : null,
                    index: selectedIndex > 0 ? selectedIndex - 1 : null
                },
                current: selectedIndex,
                total: studentInClassrooms.length
            }
        };

        res.status(200).json(result);
    } catch (e) {
        console.error(e);
        res.status(500).send('Server Error');
    }
};


exports.CheckFeeAllStudent = async (req, res) => {
    try {
        if (req.user.roleId < 1) {
            return res.status(400).json({ message: 'การเข้าถึงถูกปฏิเสธ', type: 'error' });
        }
        const { education_year_name, education_term_name, level_name, room_name } = req.body;

        const requiredFields = {
            education_year_name: 'educationYear',
            education_term_name: 'educationTerm',
            level_name: 'Level',
            room_name: 'Room',
        };
    
        const errorMessage = ValidateRequiredFields(req.body, requiredFields);
        
        if (errorMessage) {
            return res.status(400).json({ message: errorMessage, type: 'error' });
        }

        const classroom = await prisma.classrooms.findFirst({
            where: {
                education_year: { name: education_year_name },
                education_term: { name: education_term_name },
                level: { name: level_name },
                room: { name: room_name }
            }
        });
        
        const classroomFees = await prisma.feeForClassroom.findMany({
            where: { classroom_id: classroom.id },
            select: {
                fee: {
                    select: {
                        amount: true,
                        name: true,
                    }
                },
            }
        });

        let students = [];
        if (req.user.roleId === 2 || req.user.roleId === 3) {
            students = await prisma.studentInClassroom.findMany({
                where: { classroom_id: classroom.id },
                select: {
                    student_sid: true,
                    student: {
                        select: { name: true, profileImg: true, },
                    },
                    no: true,
                    pay_status: true,
                    studentReceipts: {
                        select: {
                            amount: true,
                            receiptBook: {
                                select: {
                                    name: true,
                                    total_page: true
                                }
                            }
                        }
                    },
                    classroom: {
                        select: {
                            level: { select: { name: true } },
                            room: { select: { name: true } },
                            education_year: { select: { name: true } },
                            education_term: { select: { name: true } },
                            feeForClassrooms: {
                                select: {
                                    id: true,
                                    fee: {
                                        select: { id: false, amount: true, name: true }
                                    }
                                }
                            },
                        }
                    },
                }
            });
        } else if (req.user.roleId === 1) {
            students = await prisma.studentInClassroom.findMany({
                where: { classroom_id: classroom.id },
                select: {
                    student_sid: true,
                    student: { select: { name: true } },
                    no: true,
                    pay_status: true,
                    classroom: {
                        select: {
                            level: { select: { name: true } },
                            room: { select: { name: true } },
                            education_year: { select: { name: true } },
                            education_term: { select: { name: true } },
                            feeForClassrooms: {
                                select: {
                                    id: true,
                                    fee: { select: { id: false, amount: true, name: true } }
                                }
                            },
                        }
                    },
                }
            });
        }
        
        let classroomFeeWithTotalFee = {
            fees: [],
            total_fee_amount: 0,
        };

        if (req.user.roleId === 2 || req.user.roleId === 3) {
            classroomFeeWithTotalFee = {
                fees: classroomFees,
                total_fee_amount: classroomFees.reduce((total, item) => total + Number(item.fee.amount), 0),
                total_students: students.length,
                total_fee_for_all_students: students.reduce((sum, student) => {
                    const totalFeeAmount = student.classroom.feeForClassrooms.reduce(
                        (total, feeForClassroom) => total + Number(feeForClassroom.fee.amount), 0
                    );
                    return sum + totalFeeAmount;
                }, 0),
                total_paid_by_all_students: students.reduce((sum, student) => {
                    const totalPaid = student.studentReceipts.reduce(
                        (receiptSum, receipt) => receiptSum + Number(receipt.amount), 0
                    );
                    return sum + totalPaid;
                }, 0),
                remaining_amount: students.reduce((sum, student) => {
                    const totalFeeAmount = student.classroom.feeForClassrooms.reduce(
                        (total, feeForClassroom) => total + Number(feeForClassroom.fee.amount), 0
                    );
                    const totalPaid = student.studentReceipts.reduce(
                        (receiptSum, receipt) => receiptSum + Number(receipt.amount), 0
                    );
                    return sum + (totalFeeAmount - totalPaid);
                }, 0),
            };

            const totalExpectedAmount = students.length * classroomFeeWithTotalFee.total_fee_amount;
            const totalReceivedAmount = classroomFeeWithTotalFee.total_paid_by_all_students;
            const totalMissingStudents = Math.floor((totalExpectedAmount - totalReceivedAmount) / classroomFeeWithTotalFee.total_fee_amount);

            classroomFeeWithTotalFee.total_missing_students = totalMissingStudents;

        } else if (req.user.roleId === 1) {
            classroomFeeWithTotalFee = {
                fees: classroomFees,
                total_students: students.length,
                total_fee_amount: classroomFees.reduce((total, item) => total + Number(item.fee.amount), 0),
            };
        }

        let studentsWithTotalFee = [];
        if (req.user.roleId === 2 || req.user.roleId === 3) {
            studentsWithTotalFee = students.map((student) => {
                const totalFeeAmount = student.classroom.feeForClassrooms.reduce(
                    (total, feeForClassroom) => total + Number(feeForClassroom.fee.amount), 0
                );
                const totalPaid = student.studentReceipts.reduce(
                    (sum, receipt) => sum + Number(receipt.amount), 0
                );
                return { ...student, total_fee_amount: totalFeeAmount, total_paid_amount: totalPaid };
            });
        } else if (req.user.roleId === 1) {
            studentsWithTotalFee = students.map(student => {
                const totalFeeAmount = student.classroom.feeForClassrooms.reduce((total, feeForClassroom) => {
                    return total + Number(feeForClassroom.fee.amount);
                }, 0);
                return { ...student, total_fee_amount: totalFeeAmount };
            });
        }
          
        res.status(200).send({ students: studentsWithTotalFee, classroom: classroomFeeWithTotalFee });
    } catch (e) {
        console.error(e);
        res.status(500).send('Server Error');
    }
};
