const toAdminProfileDto = (admin) => ({
  id: admin._id,
  name: admin.name,
  email: admin.email,
  phone: admin.phone,
  photo: admin.photo || null,
  role: admin.role,
  services: admin.services || [],
  status: admin.status,
  createdAt: admin.createdAt,
  updatedAt: admin.updatedAt,
});

export { toAdminProfileDto };
