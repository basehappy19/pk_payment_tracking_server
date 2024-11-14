const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getImportOptions = async (req,res) => {
    try {
        if(req.user.roleId < 1){
            return res.status(401).json({ message: 'คุณไม่มีสิทธิ์เข้าถึง', type: 'error' });
        }
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