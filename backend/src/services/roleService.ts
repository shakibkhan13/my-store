import prisma from "../config/db.js";


export const createRole = async (data: {
    name: string;
    slug: string;
    description?: string;
    isDefault?: boolean; 
}) =>{
    const existingRole = await prisma.role.findFirst({
        where: {
            OR: [
                {name: data.name}, 
                {slug: data.slug}
            ]
        }
    });
    
    if(existingRole){
        throw new Error("Role already exists."); 
    }

    return prisma.role.create({
        data: {
            name: data.name, 
            slug: data.slug, 
            description: data.description, 
            isDefault: data.isDefault ?? false,  
        },
    });
}; 


export const getRoles = async()=>{
    return prisma.role.findMany({
        orderBy: {
            createdAt: "desc",
        },
    });
}; 


export const getRoleById = async(id: string) =>{
    const role = await prisma.role.findUnique({
        where: {
            id: BigInt(id), 
        }, 
        include: {
            permissions: {
                include: {
                    permission: true,
                },
            },
        },
    }); 

    if(!role){
        throw new Error("Role not found"); 
    }

    return role; 
} ; 


export const updateRole = async(
    id: string, 
    data: {
        name?: string, 
        slug?: string, 
        description?: string, 
        isDefault?: boolean, 
    }
) => {
    const role = await prisma.role.findUnique({
        where: {
            id: BigInt(id),
        },
    }); 

    if(!role){
        throw new Error("Role not found"); 
    }

    return prisma.role.update({
        where: {
            id: BigInt(id),
        }, 
        data,
    }); 
}; 

export const deleteRole = async (id: string) =>{
    const role = await prisma.role.findUnique({
        where: {
            id: BigInt(id),
        }, 
    }); 

    if(!role){
        throw new Error("Role not found"); 
    }

    return prisma.role.delete({
        where: {
            id:BigInt(id)
        },
    });
};




