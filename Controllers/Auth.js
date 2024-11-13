const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.getUserData = async (req,res) => {
    const token = req.header('authorization');
    if (!token) {
        return res.status(401).json({ message: 'การเข้าถึงถูกปฏิเสธ', type: 'error' });
    }
    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        
        if(decoded.student !== undefined){
            const user = await prisma.students.findUnique({
                where: {sid:decoded.student.id},
                select: {
                    sid:true,
                    cid:true,
                    name:true,
                    profileImg: true,
                }
            });
            return res.send(user).status(200);
        }
        if (decoded.user !== undefined) {
            const user = await prisma.users.findUnique(
                {
                    where: {id:decoded.user.id},
                    select: {
                        id:true,
                        username:true,
                        fullname:true,
                        role:true,
                    }
                }
            );
            return res.send(user).status(200);
        } else {
            return res.json({message: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้', type: 'error'}).status(401);
        }

    } catch (e) {
        console.error(e);
        res.status(500).send('Server Error');
    }
}

exports.StudentLogin = async (req,res) => {
    try {
        const { sid, cid } = req.body;
        const student = await prisma.students.findFirst({where: {sid:parseInt(sid), cid:cid}});

        if (!student) {
            return res.json({message: 'รหัสนักเรียน หรือ เลขบัตรปชชไม่ถูกต้อง', type: 'error'}).status(200);
        }

        const payload = {
            student: {id: student.sid}
        }

        const token = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '1d' });

        res.json({token,payload}).status(200);
    } catch (e) {
        console.error(e);
        res.status(500).send('Server Error');
    }
}

exports.UserLogin = async(req,res) => {
    try {
        const { username, password } = req.body;
        const user = await prisma.users.findFirst({ 
            where: {username : username}
        });

        if (!user) {
            return res.json({message: 'ชื่อผู้ใช้ หรือ รหัสผ่านไม่ถูกต้อง', type: 'error'}).status(401);
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch){
            return res.json({message: 'ชื่อผู้ใช้ หรือ รหัสผ่านไม่ถูกต้อง', type: 'error'}).status(401);
        }

        const payload = {
            user: {id: user.id, roleId: user.roleId}
        };

        const token = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '1d' });

        res.json({token,payload}).status(200);
    } catch (e) {
        console.error(e);
        res.status(500).send('Server Error');
    }
}