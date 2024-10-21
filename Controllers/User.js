const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const validateRequiredFields = require("../Functions/ValidateRequiredFields");
const bcrypt = require('bcryptjs');
require('dotenv').config();

exports.AddRole = async (req,res) => {
    try {
        const {name} = req.body;
        
        const requiredFields = {
            name: 'Name',
        };
    
        const errorMessage = validateRequiredFields(req.body, requiredFields);
    
        if (errorMessage) {
            return res.status(400).json({ message: errorMessage, type: 'error' });
        }

        await prisma.roles.create({
            data:{
                name
            }
        });
        res.status(201).json({ message: `เพิ่มตำแหน่ง "${name}" เรียบร้อยแล้ว`, type: "success", name});
    } catch (env) {
        console.error(e);
        res.status(500).send('Server Error');
    }
}

exports.AddUser = async (req,res) => {
    try {
        const {username, password, fullName, roleId} = req.body;
        
        if (!username || !password || !fullName || !roleId) {
            return res.status(400).json({ message: 'Please provide all required fields: username, password, fullName, roleId.', type: 'error'});
        }
        const requiredFields = {
            username: 'Name',
            password: 'Password',
            fullName: 'FullName',
            roleId: 'Role Id',
        };
    
        const errorMessage = validateRequiredFields(req.body, requiredFields);
    
        if (errorMessage) {
            return res.status(400).json({ message: errorMessage, type: 'error' });
        }

        let user = await prisma.users.findUnique({where: {username : username}});
                
        if(user){
            return res.status(400).json({ message: `มีชื่อ ${username} อยู่แล้ว`, type:'error'});
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = await prisma.users.create({
            data: {
                username,
                password: hashedPassword,  
                fullName,
                roleId,
            }
        });

        res.status(201).json({ message: `เพิ่ม ${username} เรียบร้อยแล้ว`, type: "success"});
    } catch (e) {
        console.error(e);
        res.status(500).send('Server Error');
    }
}