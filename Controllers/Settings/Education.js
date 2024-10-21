const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const validateRequiredFields = require("../../Functions/validateRequiredFields");

exports.getEducationYears = async (req, res) => {
    try {
        const { search, page = 1, pageSize = 10 } = req.query; 
        
        const pageNumber = parseInt(page);
        const size = parseInt(pageSize);
        
        const skip = (pageNumber - 1) * size;

        const [years, totalRecords] = await Promise.all([
            prisma.educationYears.findMany({
                where: search
                    ? {
                        name: {
                            contains: search,
                        },
                    }
                    : {},
                skip: skip, 
                take: size,  
            }),
            prisma.educationYears.count({
                where: search ? { name: { contains: search } } : {},
            }),
        ]);

        const totalPages = Math.ceil(totalRecords / size);

        res.status(200).json({
            data: years,
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
};

exports.AddEducationYear = async (req,res) => {
    try {
        const { name } = req.body;

        const requiredFields = {
            name: 'Name',
        };
    
        const errorMessage = validateRequiredFields(req.body, requiredFields);
    
        if (errorMessage) {
            return res.status(400).json({ message: errorMessage, type: 'error' });
        }
        
        const existingEducationYear = await prisma.educationYears.findFirst({
            where: {      
                name:name
            },
        });

        if (existingEducationYear) {
            return res.status(200).json({
                message: `ปีการศึกษา ${name} มีซ้ำในระบบแล้ว`,
                type: 'error',
            });
        }

        await prisma.educationYears.create({data:{name}});
        res.json({message:`เพิ่มปีการศึกษา ${name} เรียบร้อยแล้ว`,type:'success'}).status(201);
    } catch (e) {
        console.error(e);
        res.status(500).send('Server Error');
    }
}

exports.EditEducationYear = async (req,res) => {
    try {
        const { id, name } = req.body;

        const requiredFields = {
            id: 'Id',
            name: 'Name',
        };
    
        const errorMessage = validateRequiredFields(req.body, requiredFields);
    
        if (errorMessage) {
            return res.status(400).json({ message: errorMessage, type: 'error' });
        }
            
        const existingEducationYear = await prisma.educationYears.findFirst({
            where: {      
                name:name
            },
        });

        if (existingEducationYear) {
            return res.status(200).json({
                message: `ปีการศึกษา ${name} มีซ้ำในระบบแล้ว`,
                type: 'error',
            });
        }

        await prisma.educationYears.update({
            where:{
                id:id
            },
            data:{
                name:name
            }
        });
        res.json({message:`แก้ไขปีการศึกษา ${name} เรียบร้อยแล้ว`,type:'success'}).status(204);
    } catch (e) {
        console.error(e);
        res.status(500).send('Server Error');
    }
}

exports.RemoveEducationYear = async (req,res) => {
    try {
        const { id } = req.body;

        const requiredFields = {
            id: 'Id',
        };
    
        const errorMessage = validateRequiredFields(req.body, requiredFields);
    
        if (errorMessage) {
            return res.status(400).json({ message: errorMessage, type: 'error' });
        }
        const educationYear = await prisma.educationYears.findFirst({where:{
            id:id
        }})

        if(!educationYear){
            return res.json({message:`ไม่สามารถลบได้ ไม่พบปีการศึกษา`,type:'error'}).status(404);
        }

        await prisma.educationYears.delete({
            where:{
                id:educationYear.id
            },
        });
        res.json({message:`ลบปีการศึกษา ${educationYear.name} เรียบร้อยแล้ว`,type:'success'}).status(204);
    } catch (e) {
        console.error(e);
        res.status(500).send('Server Error');
    }
}

exports.getEducationTerms = async (req,res) => {
    try {
        const { search, page = 1, pageSize = 10 } = req.query; 
        
        const pageNumber = parseInt(page);
        const size = parseInt(pageSize);
        
        const skip = (pageNumber - 1) * size;

        const [terms, totalRecords] = await Promise.all([
            prisma.educationTerms.findMany({
                where: search
                    ? {
                        name: {
                            contains: search,
                        },
                    }
                    : {},
                skip: skip, 
                take: size,  
            }),
            prisma.educationTerms.count({
                where: search ? { name: { contains: search } } : {},
            }),
        ]);

        const totalPages = Math.ceil(totalRecords / size);

        res.status(200).json({
            data: terms,
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

exports.AddEducationTerm = async (req,res) => {
    try {
        const { name } = req.body;
        const requiredFields = {
            name: 'Name',
        };
    
        const errorMessage = validateRequiredFields(req.body, requiredFields);
    
        if (errorMessage) {
            return res.status(400).json({ message: errorMessage, type: 'error' });
        }

        const existingEducationTerm = await prisma.educationTerms.findFirst({
            where: {      
                name:name
            },
        });

        if (existingEducationTerm) {
            return res.status(200).json({
                message: `ภาคเรียน ${name} มีซ้ำในระบบแล้ว`,
                type: 'error',
            });
        }

        await prisma.educationTerms.create({data:{name}});
        res.json({message:`เพิ่มภาคเรียน ${name} เรียบร้อยแล้ว`,type:'success'}).status(201);
    } catch (e) {
        console.error(e);
        res.status(500).send('Server Error');
    }
}

exports.EditEducationTerm = async (req,res) => {
    try {
        const { id, name } = req.body;

        const requiredFields = {
            id: 'Id',
            name: 'Name',
        };
    
        const errorMessage = validateRequiredFields(req.body, requiredFields);
    
        if (errorMessage) {
            return res.status(400).json({ message: errorMessage, type: 'error' });
        }
        
        const existingEducationTerm = await prisma.educationTerms.findFirst({
            where: {      
                name:name
            },
        });

        if (existingEducationTerm) {
            return res.status(200).json({
                message: `ภาคเรียน ${name} มีซ้ำในระบบแล้ว`,
                type: 'error',
            });
        }

        await prisma.educationTerms.update({
            where:{
                id:id
            },
            data:{
                name:name
            }
        });
        res.json({message:`แก้ไขภาคเรียน ${name} เรียบร้อยแล้ว`,type:'success'}).status(204);
    } catch (e) {
        console.error(e);
        res.status(500).send('Server Error');
    }
}

exports.RemoveEducationTerm = async (req,res) => {
    try {
        const { id } = req.body;

        const requiredFields = {
            id: 'Id',
        };
    
        const errorMessage = validateRequiredFields(req.body, requiredFields);
    
        if (errorMessage) {
            return res.status(400).json({ message: errorMessage, type: 'error' });
        }
        const educationTerm = await prisma.educationTerms.findFirst({where:{
            id:id
        }})

        if(!educationTerm){
            return res.json({message:`ไม่สามารถลบได้ ไม่พบภาคเรียน`,type:'error'}).status(404);
        }

        await prisma.educationTerms.delete({
            where:{
                id:educationTerm.id
            },
        });
        res.json({message:`ลบภาคเรียน ${educationTerm.name} เรียบร้อยแล้ว`,type:'success'}).status(204);
    } catch (e) {
        console.error(e);
        res.status(500).send('Server Error');
    }
}