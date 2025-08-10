import * as z from "zod";

export const LoginRequestSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export const SwitchProjectRequestSchema = z.object({
  project_id: z.string(),
});

export const VMCreateRequestSchema = z.object({
  name: z.string(),
  image_id: z.string(),
  flavor_id: z.string(),
  network_id: z.string(),
  key_name: z.string(),
  security_group: z.string(),
  admin_password: z.string(),
  admin_username: z.string(),
});

export const VMwareImportRequestSchema = z.object({
  vm_name: z.string(),
  description: z.string().optional(),
  min_disk: z.number().optional(),
  min_ram: z.number().optional(),
  is_public: z.boolean().default(false),
  flavor_id: z.string(),
  network_id: z.string(),
  key_name: z.string(),
  security_group: z.string(),
  admin_password: z.string(),
  vmdk_file: z.instanceof(File),
});

export const CreateFromDescriptionRequestSchema = z.object({
  description: z.string(),
  vm_name: z.string().optional(),
  timeout: z.number().optional(),
});

export const ProjectAssignmentSchema = z.object({
  user_id: z.string(),
  roles: z.array(z.string()),
});

export const ProjectCreateRequestSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  domain_id: z.string().optional(),
  enabled: z.boolean(),
  assignments: z.array(ProjectAssignmentSchema),
});

export const ProjectUpdateRequestSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  enabled: z.boolean().optional(),
});

export const AssignUserToProjectRequestSchema = z.object({
  user_id: z.string(),
  project_id: z.string(),
  role_names: z.array(z.string()),
});

export const RemoveUserFromProjectRequestSchema = z.object({
  user_id: z.string(),
  project_id: z.string(),
});

export const UpdateUserRolesRequestSchema = z.object({
  user_id: z.string(),
  project_id: z.string(),
  role_ids: z.array(z.string()),
});

export const UserCreateRequestSchema = z.object({
  name: z.string(),
  email: z.string(),
  password: z.string(),
  project_id: z.string().optional(),
  roles: z.array(z.string()),
});

export const UserProjectAssignmentSchema = z.object({
  project_id: z.string(),
  roles: z.array(z.string()),
});

export const UserUpdateRequestSchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  password: z.string().optional(),
  enabled: z.boolean().optional(),
  projects: z.array(UserProjectAssignmentSchema).optional(),
});

export const ImageImportFromUrlRequestSchema = z.object({
  image_url: z.string(),
  image_name: z.string(),
  visibility: z.enum(["private", "public"]).optional(),
});

export const AllocationPoolSchema = z.object({
  start: z.string(),
  end: z.string(),
});

export const SubnetCreateRequestSchema = z.object({
  name: z.string(),
  ip_version: z.number(),
  cidr: z.string(),
  gateway_ip: z.string(),
  enable_dhcp: z.boolean(),
  allocation_pools: z.array(AllocationPoolSchema),
  dns_nameservers: z.array(z.string()),
  host_routes: z.array(z.string()),
});

export const NetworkCreateRequestSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  mtu: z.number().optional(),
  shared: z.boolean().optional(),
  port_security_enabled: z.boolean().optional(),
  availability_zone_hints: z.array(z.string()).optional(),
  subnet: SubnetCreateRequestSchema.optional(),
});

export const RouterCreateRequestSchema = z.object({
  router_name: z.string(),
  external_network_id: z.string(),
});

export const RouterAddInterfaceRequestSchema = z.object({
  subnet_id: z.string(),
});

export const flavorSchema = z.object({
  flavor_id: z.string().min(1, "Please select a flavor"),
});

export const imageSchema = z.object({
  image_id: z.string().min(1, "Please select an image"),
});

export const networkSchema = z.object({
  network_id: z.string().min(1, "Please select a network"),
  key_name: z.string().min(1, "Please select a key pair"),
  security_group: z.string().min(1, "Please select a security group"),
});

export const vmDetailsSchema = z.object({
  name: z.string().min(1, "VM name is required").max(50, "Name too long"),
  admin_username: z
    .string()
    .min(1, "Admin username is required")
    .max(30, "Username too long"),
  admin_password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(50, "Password too long"),
});

export const importVMSchema = z.object({
  vm_name: z.string().min(1, "VM name is required"),
  description: z.string().optional(),
  min_disk: z.number().min(1).optional(),
  min_ram: z.number().min(1).optional(),
  is_public: z.boolean(),
  flavor_id: z.string().min(1, "Please select a flavor"),
  network_id: z.string().min(1, "Please select a network"),
  key_name: z.string().min(1, "Please select a key pair"),
  security_group: z.string().min(1, "Please select a security group"),
  admin_password: z.string().min(8, "Password must be at least 8 characters"),
});
