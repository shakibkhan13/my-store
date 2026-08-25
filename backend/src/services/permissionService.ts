import prisma from "../config/db.js";


export const createPermission = async (
    data: {
        name: string;
        slug: string;
        module: string;
        description?: string;
    }
) => {
    const existingPermission = await prisma.permission.findFirst({
        where: {
            OR: [
                {
                    name: data.name
                },
                {
                    slug: data.slug
                }
            ]
        }
    });

    if (existingPermission) {
        throw new Error("Permission already exists");
    }

    return prisma.permission.create({
        data: {
            name: data.name,
            slug: data.slug, 
            module: data.module, 
            description: data.description, 
        },
    }); 
}; 


export const getPermission = async() =>{
    return prisma.permission.findMany({
        orderBy: [
            {
                module: "asc",
            }, 
            {
                name: "asc"
            },
        ],
    });
}; 


export const getPermissionById = async(id: string)=>{
    const permission = await prisma.permission.findUnique({
        where: {
            id: BigInt(id), 
        }, 
    }); 

    if(!permission){
        throw new Error("Permission not found"); 
    }
    return permission ; 
}

export const updatePermission = async(
    id: string, 
    data: {
        name?: string;
        slug?: string;
        module?: string; 
        description?: string; 

    }
) => {
    const permission = await prisma.permission.findUnique({
        where: {
            id: BigInt(id), 
        }, 
    }); 

    if(!permission){
        throw new Error("Permission not found");     
    }

    return prisma.permission.update({
        where: {
            id: BigInt(id), 
        }, 
        data
    }); 
}; 

export const deletePermission = async (id: string)=>{
    const permission = await prisma.permission.findUnique({
        where: {
            id: BigInt(id), 
        }
    }); 

    if(!permission){
        throw new Error("Permission not found"); 
    }

    return prisma.permission.delete({
        where: {
            id: BigInt(id),
        },
    });
}; 



