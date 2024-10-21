const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const validateRequiredFields = require("../../Functions/validateRequiredFields");

exports.getReceiptBookOptions = async (req,res) => {
    try {
        const receiptBooks = await prisma.receiptBooks.findMany({
            select:{
                id:true,
                name:true,
                total_page:true,
            }, 
        });

        res.status(200).json({
            receiptBooks: receiptBooks,
        });
    } catch (e) {
        console.error(e);
        res.status(500).send('Server Error');
    }
}

exports.getReceiptBooks = async (req,res) => {
    try {
        const { search, page = 1, pageSize = 10 } = req.query; 
        
        const pageNumber = parseInt(page);
        const size = parseInt(pageSize);
        
        const skip = (pageNumber - 1) * size;

        const searchFilter = search
            ? {
                OR: [
                    { name: {contains: search} },
                    { total_page: isNaN(parseInt(search)) ? undefined : parseInt(search)},
                ].filter(Boolean) 
            }
            : {};

        const [receiptBooks, totalRecords] = await Promise.all([
            prisma.receiptBooks.findMany({
                where: searchFilter,
                skip: skip, 
                take: size,  
            }),
            prisma.receiptBooks.count({
                where: searchFilter,
            }),
        ]);

        const totalPages = Math.ceil(totalRecords / size);

        res.status(200).json({
            data: receiptBooks,
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

exports.AddReceiptBook = async (req,res) => {
    try {
        const { name, total_page = 0 } = req.body;

        const requiredFields = {
            name: 'Name',
            total_page: 'Total page',
        };
    
        const errorMessage = validateRequiredFields(req.body, requiredFields);
    
        if (errorMessage) {
            return res.status(400).json({ message: errorMessage, type: 'error' });
        }

        await prisma.receiptBooks.create({data:{name, total_page}});
        res.json({message: `เพิ่มเล่มใบเสร็จรับเงิน ${name} จำนวน ${total_page} หน้า เรียบร้อยแล้ว`,type:'success'})
    } catch (e) {
        console.error(e);
        res.status(500).send('Server Error');
    }
}

exports.EditReceiptBook = async (req,res) => {
    try {
        const { id, name, total_page } = req.body;

        const requiredFields = {
            id: 'Id',
            name: 'Name',
            total_page: 'Total page',
        };
    
        const errorMessage = validateRequiredFields(req.body, requiredFields);
    
        if (errorMessage) {
            return res.status(400).json({ message: errorMessage, type: 'error' });
        }

        await prisma.receiptBooks.update({
            where:{
                id:id
            },
            data:{
                name:name,
                total_page:total_page,
            }
        });
        res.json({message:`แก้ไขเล่มใบเสร็จ ${name} จำนวน ${total_page} หน้า เรียบร้อยแล้ว`,type:'success',type:'success'}).status(204);
    } catch (e) {
        console.error(e);
        res.status(500).send('Server Error');
    }
}

exports.RemoveReceiptBook = async (req,res) => {
    try {
        const { id } = req.body;

        const requiredFields = {
            id: 'Id',
        };
    
        const errorMessage = validateRequiredFields(req.body, requiredFields);
    
        if (errorMessage) {
            return res.status(400).json({ message: errorMessage, type: 'error' });
        }
        const receiptBook = await prisma.receiptBooks.findFirst({
            select:{
                id:true,
                name:true,
                total_page:true,
            },
            where:{
                id:id
            }
        })

        if(!receiptBook){
            return res.json({message:`ไม่สามารถลบได้ ไม่พบเล่มใบเสร็จ`,type:'error'}).status(200);
        }

        await prisma.receiptBooks.delete({
            where:{
                id:receiptBook.id
            },
        });
        res.json({message:`ลบเล่มใบเสร็จ ${receiptBook.name} จำนวน ${receiptBook.total_page} หน้า เรียบร้อยแล้ว`,type:'success'}).status(204);
    } catch (e) {
        console.error(e);
        res.status(500).send('Server Error');
    }
}




