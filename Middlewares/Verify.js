const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');

exports.VerifyStudent = async (req,res,next) => {
    const token = req.header('authorization');

    if (!token) {
        return res.status(401).json({ message: 'การเข้าถึงถูกปฏิเสธ', type: 'error' });
    }
    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        if(!decoded.student){
            return res.status(401).json({ message: 'การเข้าถึงถูกปฏิเสธ', type: 'error' });
        }
        req.student = decoded.student;
        next(); 
    } catch (e) {
        console.error(e);
        res.status(401).json({ message: 'การเข้าถึงถูกปฏิเสธ', type: 'error' });
    }
}

exports.VerifyTeacher = async (req,res,next) => {
    const token = req.header('authorization');

    if (!token) {
        return res.status(401).json({ message: 'การเข้าถึงถูกปฏิเสธ', type: 'error' });
    }
    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        if(!decoded.user){
            return res.status(401).json({ message: 'คุณไม่มีสิทธิ์เข้าถึง', type: 'error' });
        }
        const { id } = decoded.user;
        const user = await prisma.users.findUnique({where:{id:id}});
        const { roleId } = user;
        if(roleId < 1){
            return res.status(401).json({ message: 'คุณไม่มีสิทธิ์เข้าถึง', type: 'error' });
        }
        req.user = { roleId };
        next();
    } catch (e) {
        console.error(e);
        res.status(401).json({ message: 'การเข้าถึงถูกปฏิเสธ', type: 'error' });
    }
}

exports.VerifyOfficer = async (req,res,next) => {
    const token = req.header('authorization');

    if (!token) {
        return res.status(401).json({ message: 'การเข้าถึงถูกปฏิเสธ', type: 'error' });
    }
    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        if(!decoded.user){
            return res.status(401).json({ message: 'คุณไม่มีสิทธิ์เข้าถึง', type: 'error' });
        }
        const { id } = decoded.user;
        const user = await prisma.users.findUnique({where:{id:id}});
        const { roleId } = user;
        if(roleId < 2){
            return res.status(401).json({ message: 'คุณไม่มีสิทธิ์เข้าถึง', type: 'error' });
        }
        req.user = { roleId };
        next();
    } catch (e) {
        console.error(e);
        res.status(401).json({ message: 'การเข้าถึงถูกปฏิเสธ', type: 'error' });
    }
}

exports.VerifySchool = async (req,res,next) => {
    const token = req.header('authorization');

    if (!token) {
        return res.status(401).json({ message: 'การเข้าถึงถูกปฏิเสธ', type: 'error' });
    }
    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        const { id } = decoded.user;
        const user = await prisma.users.findUnique({where:{id:id}});
        const { roleId } = user;
        if(roleId < 3){
            return res.status(401).json({ message: 'คุณไม่มีสิทธิ์เข้าถึง', type: 'error' });
        }
        req.user = { roleId };
        next();
    } catch (e) {
        console.error(e);
        res.status(401).json({ message: 'การเข้าถึงถูกปฏิเสธ', type: 'error' });
    }
}