const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const validateRequiredFields = require("../../Functions/validateRequiredFields");

exports.getFeeOptions = async (req,res) => {
    try {

        const fees = await prisma.fees.findMany({
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
                createdAt:true,
                updatedAt:true,
            },
        });


        res.status(200).json({
            fees: fees,
        });
    } catch (e) {
        console.error(e);
        res.status(500).send('Server Error');
    }
}

exports.getFees = async (req,res) => {
    try {
        const { search, page = 1, pageSize = 10 } = req.query; 
        
        const pageNumber = parseInt(page);
        const size = parseInt(pageSize);
        
        const skip = (pageNumber - 1) * size;

        const searchFilter = search
            ? {
                OR: [
                    { amount: isNaN(parseInt(search)) ? undefined : parseInt(search)},
                    { name: {contains: search} },
                    { education_year: { name: {contains: search} } },
                    { education_term: { name: {contains: search} } },
                ].filter(Boolean) 
            }
            : {};

        const [fees, totalRecords] = await Promise.all([
            prisma.fees.findMany({
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
                    createdAt:true,
                    updatedAt:true,
                },
                where: searchFilter,
                skip: skip, 
                take: size,  
            }),
            prisma.fees.count({
                where: searchFilter,
            }),
        ]);

        const totalPages = Math.ceil(totalRecords / size);

        res.status(200).json({
            data: fees,
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

exports.AddFee = async (req,res) => {
    try {
        const { amount, name, education_year_id, education_term_id } = req.body;

        const requiredFields = {
            amount: 'Amount',
            name: 'Name',
            education_year_id: 'Education Year',
            education_term_id: 'Education Term',
        };
        
        const errorMessage = validateRequiredFields(req.body, requiredFields);
    
        if (errorMessage) {
            return res.status(400).json({ message: errorMessage, type: 'error' });
        }

        const education_year = await prisma.educationYears.findFirst({
            where:{
                id:education_year_id
            }
        })

        if(!education_year){
            return res.status(200).json({ message: 'ไม่สามารถเพื่มค่าธรรมเนียมได้ ไม่พบปีการศึกษา', type: 'error' });
        }

        const education_term = await prisma.educationTerms.findFirst({
            where:{
                id:education_term_id
            }
        })

        if(!education_term){
            return res.status(200).json({ message: 'ไม่สามารถเพื่มค่าธรรมเนียมได้ ไม่พบภาคเรียน', type: 'error' });
        }

        await prisma.fees.create({data:{amount:amount, name:name, education_year_id:education_year.id, education_term_id:education_term.id}});
        res.json({message: `เพิ่มค่าธรรมเนียม ${name} จำนวน ${amount} บาท ในปีการศึกษา ${education_year.name} ภาคเรียนที่ ${education_term.name} เรียบร้อยแล้ว`,type:'success'})
    } catch (e) {
        console.error(e);
        res.status(500).send('Server Error');
    }
}

exports.EditFee = async (req,res) => {
    try {
        const { id, amount, name, education_year_id, education_term_id } = req.body;
        
        const requiredFields = {
            id: 'Id',
            amount: 'Amount',
            name: 'Name',
            education_year_id: 'Education Year',
            education_term_id: 'Education Term',
        };
    
        const errorMessage = validateRequiredFields(req.body, requiredFields);
    
        if (errorMessage) {
            return res.status(400).json({ message: errorMessage, type: 'error' });
        }
        
        const education_year = await prisma.educationYears.findFirst({
            where:{
                id:education_year_id
            }
        })

        if(!education_year){
            return res.status(200).json({ message: 'ไม่สามารถแก้ไขค่าธรรมเนียมได้ ไม่พบปีการศึกษา', type: 'error' });
        }

        const education_term = await prisma.educationTerms.findFirst({
            where:{
                id:education_term_id
            }
        })

        if(!education_term){
            return res.status(200).json({ message: 'ไม่สามารถแก้ไขค่าธรรมเนียมได้ ไม่พบภาคเรียน', type: 'error' });
        }

        await prisma.fees.update({
            where:{
                id:id
            },
            data:{
                amount:amount,
                name:name,
                education_year_id:education_year.id,
                education_term_id:education_term.id,
            }
        });
        res.json({message:`แก้ไขค่าธรรมเนียม ${name} จำนวน ${amount} บาท ในปีการศึกษา ${education_year.name} ภาคเรียนที่ ${education_term.name} เรียบร้อยแล้ว`,type:'success'}).status(204);
    } catch (e) {
        console.error(e);
        res.status(500).send('Server Error');
    }
}

exports.RemoveFee = async (req,res) => {
    try {
        const { id } = req.body;

        const requiredFields = {
            id: 'Id',
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
                education_year:{
                    select:{
                        name:true
                    }
                },
                education_term:{
                    select:{
                        name:true
                    }
                }
            },
            where:{
                id:id
            }
        })

        if(!fee){
            return res.json({message:`ไม่สามารถลบได้ ไม่พบค่าธรรมเนียม`,type:'error'}).status(200);
        }

        await prisma.fees.delete({
            where:{
                id:fee.id
            },
        });
        res.json({message:`ลบธรรมเนียม ${fee.name} จำนวน ${fee.amount} บาท ในปีการศึกษา ${fee.education_year.name} ภาคเรียนที่ ${fee.education_term.name} เรียบร้อยแล้ว`,type:'success'}).status(204);
    } catch (e) {
        console.error(e);
        res.status(500).send('Server Error');
    }
}

