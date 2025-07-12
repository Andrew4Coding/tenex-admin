import { prismaAdmin } from "prisma-admin/prisma-admin";
import type { ActionFunctionArgs } from "react-router";

export async function SettingsUserAction({ request }: ActionFunctionArgs) {
  try {
    const formData = await request.formData();
    const intent = String(formData.get('intent') || 'create');

    switch (intent) {
      case 'create':
        return await handleCreate(formData);
      case 'delete-single':
        return await handleDeleteSingle(formData);
      case 'delete-bulk':
        return await handleDeleteBulk(formData);
      case 'update':
        return await handleUpdate(formData);
      default:
        return { success: false, error: 'Invalid intent.' };
    }
  } catch (error: any) {
    console.error('Error in SettingsUserAction:', error);
    return { 
      success: false, 
      error: error.message || 'An error occurred while processing the request.' 
    };
  }
}

async function handleCreate(formData: FormData) {
  const email = String(formData.get('email') || '').trim();
  const permissions = JSON.parse(String(formData.get('permissions') || '{}'));

  if (!email) {
    return { success: false, error: 'Email is required.' };
  }

  // Check if user already exists
  const existingUser = await prismaAdmin.allowedUser.findUnique({
    where: { email }
  });

  if (existingUser) {
    return { success: false, error: 'User with this email already exists.' };
  }

  // Create the allowed user first
  const allowedUser = await prismaAdmin.allowedUser.create({
    data: {
      email,
    }
  });

  // Create permissions for each model
  const permissionPromises = Object.entries(permissions).map(([model, perms]: [string, any]) => 
    prismaAdmin.userModelPermission.create({
      data: {
        allowedUserId: allowedUser.id,
        model,
        canCreate: perms.create || false,
        canRead: perms.read || false,
        canUpdate: perms.update || false,
        canDelete: perms.delete || false,
      }
    })
  );

  await Promise.all(permissionPromises);

  // Fetch the created user with permissions
  const createdUser = await prismaAdmin.allowedUser.findUnique({
    where: { id: allowedUser.id },
    include: {
      UserModelPermission: true
    }
  });

  return { 
    success: true, 
    data: createdUser,
    message: 'User added successfully with specified permissions.'
  };
}

async function handleDeleteSingle(formData: FormData) {
  const id = String(formData.get('id') || '');

  if (!id) {
    return { success: false, error: 'User ID is required.' };
  }

  // Delete the user and all associated permissions (cascade)
  await prismaAdmin.allowedUser.delete({
    where: { id }
  });

  return { 
    success: true, 
    message: 'User deleted successfully.'
  };
}

async function handleDeleteBulk(formData: FormData) {
  const ids = formData.getAll('ids').map(id => String(id));

  if (!ids.length) {
    return { success: false, error: 'No user IDs provided.' };
  }

  // Delete multiple users and all associated permissions (cascade)
  const result = await prismaAdmin.allowedUser.deleteMany({
    where: { id: { in: ids } }
  });

  return { 
    success: true, 
    deletedCount: result.count,
    message: `Successfully deleted ${result.count} user(s).`
  };
}

async function handleUpdate(formData: FormData) {
  const id = String(formData.get('id') || '');
  const email = String(formData.get('email') || '').trim();
  const permissions = JSON.parse(String(formData.get('permissions') || '{}'));

  if (!id) {
    return { success: false, error: 'User ID is required.' };
  }

  if (!email) {
    return { success: false, error: 'Email is required.' };
  }

  // Check if email is already taken by another user
  const existingUser = await prismaAdmin.allowedUser.findUnique({
    where: { email }
  });

  if (existingUser && existingUser.id !== id) {
    return { success: false, error: 'Email is already taken by another user.' };
  }

  // Update the user
  await prismaAdmin.allowedUser.update({
    where: { id },
    data: { email }
  });

  // Delete existing permissions and create new ones
  await prismaAdmin.userModelPermission.deleteMany({
    where: { allowedUserId: id }
  });

  // Create new permissions
  const permissionPromises = Object.entries(permissions).map(([model, perms]: [string, any]) => 
    prismaAdmin.userModelPermission.create({
      data: {
        allowedUserId: id,
        model,
        canCreate: perms.create || false,
        canRead: perms.read || false,
        canUpdate: perms.update || false,
        canDelete: perms.delete || false,
      }
    })
  );

  await Promise.all(permissionPromises);

  // Fetch the updated user with permissions
  const updatedUser = await prismaAdmin.allowedUser.findUnique({
    where: { id },
    include: {
      UserModelPermission: true
    }
  });

  return { 
    success: true, 
    data: updatedUser,
    message: 'User updated successfully with new permissions.'
  };
}
