const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const ValidateRequiredFields = require("../Functions/ValidateRequiredFields");
const bcrypt = require('bcryptjs');
require('dotenv').config();

exports.AllUsers = async (req, res) => {
    try {
        const { search, page = 1, pageSize = 10 } = req.query; 
        
        const pageNumber = parseInt(page);
        const size = parseInt(pageSize);
        
        const skip = (pageNumber - 1) * size;

        const searchFilter = search
            ? {
                OR: [
                    { username: { contains: search } },
                    { fullname: {contains: search } },
                    { role: { name: {contains: search} } },
                ].filter(Boolean) 
            }
            : {};

            const [users, totalRecords] = await Promise.all([
                prisma.users.findMany({
                    select: {
                        id:true,
                        username: true,
                        fullname: true,
                        role: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                        createdAt: true,
                        updatedAt: true,
                    },
                    where: searchFilter,
                    skip: skip,
                    take: size,
                }),
                prisma.users.count({
                    where: searchFilter,
                }),
            ]);
    
            const totalPages = Math.ceil(totalRecords / size);
    
            res.status(200).json({
                data: users,
                pagination: {
                    totalRecords,
                    totalPages,
                    currentPage: pageNumber,
                    pageSize: size,
                },
            });
    } catch (e) {
        console.log(e);
        res.send(`Server Error`).status(500);
    }
}

exports.AddUser = async (req,res) => {
    try {
        const {username, password, fullname, roleId} = req.body;
        
        if (!username || !password || !fullname || !roleId) {
            return res.status(400).json({ message: 'Please provide all required fields: username, password, fullname, roleId.', type: 'error'});
        }
        const requiredFields = {
            username: 'Name',
            password: 'Password',
            fullname: 'Full Name',
            roleId: 'Role Id',
        };
    
        const errorMessage = ValidateRequiredFields(req.body, requiredFields);
    
        if (errorMessage) {
            return res.status(400).json({ message: errorMessage, type: 'error' });
        }

        let user = await prisma.users.findUnique({where: {username : username}});
                
        if(user){
            return res.status(200).json({ message: `มีชื่อ ${username} อยู่แล้ว`, type:'error'});
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = await prisma.users.create({
            data: {
                username,
                password: hashedPassword,  
                fullname,
                roleId,
            }
        });

        res.status(201).json({ message: `เพิ่ม ${username} เรียบร้อยแล้ว`, type: "success"});
    } catch (e) {
        console.error(e);
        res.status(500).send('Server Error');
    }
}

exports.EditUser = async (req, res) => {
    try {
        const { id, username, password, fullname, roleId } = req.body;
        
        const user = await prisma.users.findFirst({
            where: {
                id: parseInt(id)
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'ไม่สามารถแก้ไขผู้ใช้ได้ ไม่พบผู้ใช้', type: 'error' });
        }

        let updatedPassword = user.password; 
        if (password) {
            const salt = await bcrypt.genSalt(10);
            updatedPassword = await bcrypt.hash(password, salt);
        }

        await prisma.users.update({
            where: {
                id: user.id
            },
            data: {
                username,
                password: updatedPassword,
                fullname,
                roleId
            }
        });

        res.status(201).json({ message: `แก้ไขผู้ใช้ ${username} เรียบร้อยแล้ว`, type: 'success' });
    } catch (e) {
        console.error(e);
        res.status(500).send(`Server Error`);
    }
};

exports.RemoveUser = async (req, res) => {
    try {
        const { id } = req.query;
        
        const user = await prisma.users.findFirst({
            where: {
                id: parseInt(id)
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'ไม่สามารถลบผู้ใช้ได้ ไม่พบผู้ใช้', type: 'error' });
        }

        await prisma.users.delete({
            where: {
                id: user.id
            }
        });

        res.status(201).json({ message: `ลบผู้ใช้ ${username} เรียบร้อยแล้ว`, type: 'success' });
    } catch (e) {
        console.error(e);
        res.status(500).send(`Server Error`);
    }
};

exports.getRoleOptions = async (req, res) => {
    try {
        const roles = await prisma.roles.findMany({
            select: {
                id: true,
                name: true,
            }
        });
        res.status(200).json({data:roles});
    } catch (e) {
        console.error(e);
        res.status(500).send(`Server Error`);
    }
}
