import * as z from "zod";

export const LoginRequestSchema = z.object({
  username: z
    .string()
    .min(2, "Username must be at least 2 characters")
    .max(32, "Username cannot exceed 32 characters")
    .regex(
      /^[a-zA-Z][a-zA-Z0-9._-]*$/,
      "Username must start with a letter and contain only alphanumeric, dot, underscore, or hyphen",
    )
    .trim(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password cannot exceed 72 characters"),
});

export const SwitchProjectRequestSchema = z.object({
  project_id: z.uuid("Invalid project ID format"),
});

export const VMCreateRequestSchema = z.object({
  name: z
    .string()
    .min(1, "VM name is required")
    .max(63, "VM name too long")
    .regex(
      /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/,
      "VM name must start and end with alphanumeric characters",
    )
    .trim(),
  image_id: z.uuid("Invalid image ID format"),
  flavor_id: z.uuid("Invalid flavor ID format"),
  network_id: z.uuid("Invalid network ID format"),
  key_name: z
    .string()
    .min(1, "Key pair name is required")
    .max(64, "Key pair name too long"),
  security_group: z
    .string()
    .min(1, "Security group name is required")
    .max(64, "Security group name too long"),
  admin_password: z
    .string()
    .min(8, "Admin password must be at least 8 characters")
    .max(72, "Admin password too long")
    .optional(),
  admin_username: z
    .string()
    .min(1, "Admin username is required")
    .max(32, "Admin username too long")
    .regex(/^[a-zA-Z][a-zA-Z0-9_-]*$/, "Invalid username format")
    .optional(),
});

export const VMwareImportRequestSchema = z.object({
  vm_name: z
    .string()
    .min(1, "VM name is required")
    .max(63, "VM name too long")
    .regex(
      /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/,
      "VM name must start and end with alphanumeric characters",
    )
    .trim(),
  description: z.string().max(500, "Description too long").trim().optional(),
  min_disk: z
    .number()
    .min(1, "Minimum disk size must be at least 1 GB")
    .max(1000, "Minimum disk size too large")
    .optional(),
  min_ram: z
    .number()
    .min(128, "Minimum RAM must be at least 128 MB")
    .max(65536, "Minimum RAM too large")
    .optional(),
  is_public: z.boolean().default(false),
  flavor_id: z.uuid("Invalid flavor ID format"),
  network_id: z.uuid("Invalid network ID format"),
  key_name: z
    .string()
    .min(1, "Key name is required")
    .max(64, "Key name too long"),
  security_group: z
    .string()
    .min(1, "Security group is required")
    .max(64, "Security group name too long"),
  admin_password: z
    .string()
    .min(8, "Admin password must be at least 8 characters")
    .max(72, "Admin password too long")
    .optional(),
  vmdk_file: z.instanceof(File),
});

export const CreateFromDescriptionRequestSchema = z.object({
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description too long")
    .trim(),
  vm_name: z
    .string()
    .max(63, "VM name too long")
    .regex(
      /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/,
      "VM name must start and end with alphanumeric characters",
    )
    .trim()
    .optional(),
  timeout: z
    .number()
    .int("Timeout must be an integer")
    .min(60, "Timeout must be at least 60 seconds")
    .max(3600, "Timeout cannot exceed 1 hour")
    .optional(),
});

export const ProjectAssignmentSchema = z.object({
  user_id: z.uuid("Invalid user ID format"),
  roles: z
    .array(
      z
        .string()
        .min(1, "Role name cannot be empty")
        .max(64, "Role name too long"),
    )
    .min(1, "At least one role is required"),
});

export const ProjectCreateRequestSchema = z.object({
  name: z
    .string()
    .min(1, "Project name is required")
    .max(64, "Project name too long")
    .regex(
      /^[a-zA-Z0-9]([a-zA-Z0-9_-]*[a-zA-Z0-9])?$/,
      "Project name must start and end with alphanumeric characters",
    )
    .trim(),
  description: z.string().max(500, "Description too long").trim().optional(),
  domain_id: z.uuid("Invalid domain ID format").optional(),
  enabled: z.boolean(),
  assignments: z.array(ProjectAssignmentSchema).default([]),
});

export const ProjectUpdateRequestSchema = z.object({
  name: z
    .string()
    .min(1, "Project name is required")
    .max(64, "Project name too long")
    .regex(
      /^[a-zA-Z0-9]([a-zA-Z0-9_-]*[a-zA-Z0-9])?$/,
      "Project name must start and end with alphanumeric characters",
    )
    .trim()
    .optional(),
  description: z.string().max(500, "Description too long").trim().optional(),
  enabled: z.boolean().optional(),
});

export const AssignUserToProjectRequestSchema = z.object({
  user_id: z.uuid("Invalid user ID format"),
  project_id: z.uuid("Invalid project ID format"),
  role_names: z
    .array(
      z
        .string()
        .min(1, "Role name cannot be empty")
        .max(64, "Role name too long"),
    )
    .min(1, "At least one role must be assigned"),
});

export const RemoveUserFromProjectRequestSchema = z.object({
  user_id: z.uuid("Invalid user ID format"),
  project_id: z.uuid("Invalid project ID format"),
});

export const UpdateUserRolesRequestSchema = z.object({
  user_id: z.uuid("Invalid user ID format"),
  project_id: z.uuid("Invalid project ID format"),
  role_ids: z
    .array(z.uuid("Invalid role ID format"))
    .min(1, "At least one role must be assigned"),
});

export const UserCreateRequestSchema = z.object({
  name: z
    .string()
    .min(1, "Username is required")
    .max(64, "Username too long")
    .regex(
      /^[a-zA-Z][a-zA-Z0-9._-]*$/,
      "Username must start with a letter and contain only letters, numbers, dots, underscores, or hyphens",
    )
    .trim(),
  email: z
    .email("Invalid email format")
    .max(254, "Email too long")
    .toLowerCase()
    .optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password too long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^_\-+=])[A-Za-z\d@$!%*?&#^_\-+=]/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    ),
  project_id: z.uuid("Invalid project ID format").optional(),
  roles: z
    .array(z.string().min(1, "Role name cannot be empty"))
    .min(1, "At least one role is required"),
});

export const UserProjectAssignmentSchema = z.object({
  project_id: z.uuid("Invalid project ID format"),
  roles: z
    .array(
      z
        .string()
        .min(1, "Role name cannot be empty")
        .max(64, "Role name too long"),
    )
    .min(1, "At least one role is required"),
});

export const UserUpdateRequestSchema = z.object({
  name: z
    .string()
    .min(1, "Username is required")
    .max(64, "Username too long")
    .regex(
      /^[a-zA-Z][a-zA-Z0-9._-]*$/,
      "Username must start with a letter and contain only letters, numbers, dots, underscores, or hyphens",
    )
    .trim()
    .optional(),
  email: z
    .email("Invalid email format")
    .max(254, "Email too long")
    .toLowerCase()
    .optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password too long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^_\-+=])[A-Za-z\d@$!%*?&#^_\-+=]/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    )
    .optional(),
  enabled: z.boolean().optional(),
  projects: z.array(UserProjectAssignmentSchema).optional(),
});

export const ImageImportFromUrlRequestSchema = z.object({
  image_url: z
    .string()
    .url("Invalid URL format")
    .min(1, "Image URL is required")
    .max(2000, "URL too long"),
  image_name: z
    .string()
    .min(1, "Image name is required")
    .max(64, "Image name too long")
    .regex(
      /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/,
      "Image name must start with alphanumeric character",
    )
    .trim(),
  visibility: z.enum(["private", "public"]).default("private").optional(),
});

export const ImageImportFromNameRequestSchema = z.object({
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description too long")
    .trim(),
  visibility: z.enum(["private", "public"]).default("private").optional(),
});

export const AllocationPoolSchema = z
  .object({
    start: z
      .string()
      .min(1, "Start IP is required")
      .regex(/^(?:\d{1,3}\.){3}\d{1,3}$/, "Invalid start IP address format")
      .refine(
        (ip) =>
          ip.split(".").every((oct) => {
            const n = Number(oct);
            return !Number.isNaN(n) && n >= 0 && n <= 255;
          }),
        "Invalid start IP address",
      ),
    end: z
      .string()
      .min(1, "End IP is required")
      .regex(/^(?:\d{1,3}\.){3}\d{1,3}$/, "Invalid end IP address format")
      .refine(
        (ip) =>
          ip.split(".").every((oct) => {
            const n = Number(oct);
            return !Number.isNaN(n) && n >= 0 && n <= 255;
          }),
        "Invalid end IP address",
      ),
  })
  .refine(
    (data) => {
      const startOctets = data.start.split(".").map(Number);
      const endOctets = data.end.split(".").map(Number);

      if (startOctets.length !== 4 || endOctets.length !== 4) return false;

      for (let i = 0; i < 4; i++) {
        const startOctet = startOctets[i];
        const endOctet = endOctets[i];

        if (startOctet === undefined || endOctet === undefined) return false;
        if (startOctet < endOctet) return true;
        if (startOctet > endOctet) return false;
      }
      return true;
    },
    { message: "Start IP must be less than or equal to end IP", path: ["end"] },
  );

export const SubnetCreateRequestSchema = z.object({
  name: z
    .string()
    .min(1, "Subnet name is required")
    .max(128, "Subnet name too long")
    .regex(
      /^[\w\-\.\(\)\[\]\:\^']+$/,
      "Subnet name contains invalid characters",
    )
    .trim(),
  ip_version: z.union([z.literal(4), z.literal(6)]),
  cidr: z
    .string()
    .regex(
      /^(\d{1,3}\.){3}\d{1,3}\/([0-9]|[1-2][0-9]|3[0-2])$/,
      "Invalid CIDR format (e.g., 192.168.1.0/24)",
    ),
  gateway_ip: z
    .string()
    .regex(/^(?:\d{1,3}\.){3}\d{1,3}$/, "Invalid gateway IP address format")
    .refine(
      (ip) =>
        ip.split(".").every((oct) => {
          const n = Number(oct);
          return !Number.isNaN(n) && n >= 0 && n <= 255;
        }),
      "Invalid gateway IP address",
    ),
  enable_dhcp: z.boolean(),
  allocation_pools: z.array(AllocationPoolSchema),
  dns_nameservers: z.array(
    z
      .string()
      .regex(
        /^(?:\d{1,3}\.){3}\d{1,3}$/,
        "Invalid DNS server IP address format",
      )
      .refine(
        (ip) =>
          ip.split(".").every((oct) => {
            const n = Number(oct);
            return !Number.isNaN(n) && n >= 0 && n <= 255;
          }),
        "Invalid DNS server IP address",
      ),
  ),
  host_routes: z.array(
    z
      .string()
      .regex(
        /^(\d{1,3}\.){3}\d{1,3}\/([0-9]|[1-2][0-9]|3[0-2])$/,
        "Invalid host route format (must be CIDR notation, e.g., 10.0.0.0/24)",
      ),
  ),
});

export const RouterCreateRequestSchema = z.object({
  router_name: z
    .string()
    .min(1, "Router name is required")
    .max(63, "Router name too long")
    .regex(
      /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/,
      "Router name must start and end with alphanumeric characters",
    )
    .trim(),
  external_network_id: z.uuid("Invalid external network ID format"),
});

export const RouterAddInterfaceRequestSchema = z.object({
  subnet_id: z.uuid("Invalid subnet ID format"),
});

export const flavorSchema = z.object({
  flavor_id: z.uuid("Invalid flavor ID format"),
});

export const imageSchema = z.object({
  image_id: z.uuid("Invalid image ID format"),
});

export const networkSchema = z.object({
  network_id: z.uuid("Invalid network ID format"),
  key_name: z
    .string()
    .min(1, "Key pair name is required")
    .max(64, "Key pair name too long"),
  security_group: z
    .string()
    .min(1, "Security group is required")
    .max(64, "Security group name too long"),
});

export const vmDetailsSchema = z.object({
  name: z
    .string()
    .min(1, "VM name is required")
    .max(63, "VM name too long")
    .regex(
      /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/,
      "VM name must start and end with alphanumeric characters",
    )
    .trim(),
  admin_username: z
    .string()
    .min(1, "Admin username is required")
    .max(32, "Username too long")
    .regex(
      /^[a-zA-Z][a-zA-Z0-9_-]*$/,
      "Username must start with a letter and contain only alphanumeric, underscore, or hyphen",
    )
    .trim(),
  admin_password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password too long"),
});

export const importVMSchema = z.object({
  vm_name: z
    .string()
    .min(1, "VM name is required")
    .max(63, "VM name too long")
    .regex(
      /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/,
      "VM name must start and end with alphanumeric characters",
    )
    .trim(),
  description: z.string().max(500, "Description too long").trim().optional(),
  min_disk: z
    .number()
    .min(1, "Minimum disk size must be at least 1 GB")
    .max(1000, "Minimum disk size too large")
    .optional(),
  min_ram: z
    .number()
    .min(128, "Minimum RAM must be at least 128 MB")
    .max(65536, "Minimum RAM too large")
    .optional(),
  is_public: z.boolean(),
  flavor_id: z.uuid("Invalid flavor ID format"),
  network_id: z.uuid("Invalid network ID format"),
  key_name: z
    .string()
    .min(1, "Key pair name is required")
    .max(64, "Key pair name too long"),
  security_group: z
    .string()
    .min(1, "Security group is required")
    .max(64, "Security group name too long"),
  admin_password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password too long"),
});

export const ScaleNodeRequestSchema = z.object({
  ip: z
    .string()
    .regex(/^(?:\d{1,3}\.){3}\d{1,3}$/, "Invalid IP address format")
    .refine(
      (v) =>
        v.split(".").every((oct) => {
          const n = Number(oct);
          return !Number.isNaN(n) && n >= 0 && n <= 255;
        }),
      "Invalid IP address",
    ),
  hostname: z
    .string()
    .min(1, "Hostname is required")
    .max(63, "Hostname too long")
    .regex(
      /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/,
      "Invalid hostname format",
    ),
  type: z.enum(["control", "compute", "storage"]),
  neutron_external_interface: z
    .string()
    .min(1, "Neutron external interface is required")
    .max(15, "Interface name too long")
    .regex(
      /^[a-zA-Z][a-zA-Z0-9\-_]*[a-zA-Z0-9]$/,
      "Invalid interface name format",
    ),
  network_interface: z
    .string()
    .min(1, "Network interface is required")
    .max(15, "Interface name too long")
    .regex(
      /^[a-zA-Z][a-zA-Z0-9\-_]*[a-zA-Z0-9]$/,
      "Invalid interface name format",
    ),
  ssh_user: z
    .string()
    .min(1, "SSH user is required")
    .max(32, "SSH username too long")
    .regex(/^[a-zA-Z][a-zA-Z0-9_-]*$/, "Invalid SSH username format"),
  ssh_password: z
    .string()
    .min(8, "SSH password must be at least 8 characters")
    .max(128, "SSH password too long"),
  deploy_tag: z
    .string()
    .min(1, "Deploy tag is required")
    .max(64, "Deploy tag too long")
    .regex(/^[a-zA-Z][a-zA-Z0-9_-]*$/, "Invalid deploy tag format"),
});

export const SendTestEmailRequestSchema = z.object({
  to: z
    .email("Invalid email format")
    .max(254, "Email address too long")
    .toLowerCase()
    .optional(),
});

export const NetworkCreateFormDataSchema = z.object({
  name: z
    .string()
    .min(1, "Network name is required")
    .max(128, "Network name too long")
    .regex(
      /^[\w\-\.\(\)\[\]\:\^']+$/,
      "Network name contains invalid characters",
    )
    .trim(),
  description: z.string().max(500, "Description too long").trim(),
  mtu: z
    .number()
    .int("MTU must be an integer")
    .min(68, "MTU too small")
    .max(9000, "MTU too large"),
  shared: z.boolean(),
  port_security_enabled: z.boolean(),
  availability_zone_hints: z.array(z.string().min(1).trim()),
  subnet: SubnetCreateRequestSchema,
});
