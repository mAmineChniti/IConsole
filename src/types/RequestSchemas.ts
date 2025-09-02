import { z } from "zod";

export const FlavorCreateRequestSchema = z.object({
  name: z.string().min(1).max(64),
  ram: z.number().min(1),
  vcpus: z.number().min(1),
  disk: z.number().min(0).optional(),
  ephemeral: z.number().min(0).optional(),
  swap: z.number().min(0).optional(),
  is_public: z.boolean().optional(),
});

export const FlavorUpdateRequestSchema = z.object({
  flavor_id: z.uuid("Invalid flavor ID format"),
  name: z.string().min(1).max(64).optional(),
  vcpus: z.number().min(1).optional(),
  ram: z.number().min(1).optional(),
  disk: z.number().min(0).optional(),
  ephemeral: z.number().min(0).optional(),
  swap: z.number().min(0).optional(),
  is_public: z.boolean().optional(),
  description: z.string().max(255).optional(),
});

export const FlavorDeleteRequestSchema = z.object({
  flavor_id: z.uuid("Invalid flavor ID format"),
});

export const VolumeCreateRequestSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  size: z.number().min(1, "Size must be at least 1 GiB"),
  description: z.string().max(255, "Description too long").optional(),
  volume_type: z.string().default("__DEFAULT__"),
  availability_zone: z.string().default("nova"),
  source_vol_id: z.string().optional(),
  group_id: z.string().optional(),
});

export const VolumeSnapshotCreateRequestSchema = z.object({
  volume_id: z.uuid("Invalid volume ID format"),
  name: z.string().min(1).max(64).trim(),
  description: z.string().max(255).trim().optional(),
  force: z.boolean().optional(),
});

export const SecurityGroupCreateRequestSchema = z.object({
  name: z
    .string()
    .min(1, "Security group name is required")
    .max(64, "Security group name too long")
    .trim(),
  description: z.string().max(255, "Description too long").trim().optional(),
  project_id: z.uuid("Invalid project ID format").optional(),
});

export const SecurityGroupRuleCreateRequestSchema = z
  .object({
    security_group_id: z.uuid("Invalid security group ID format"),
    direction: z.enum(["ingress", "egress"]),

    ethertype: z.enum(["IPv4", "IPv6"]).optional(),

    protocol: z
      .string()
      .min(1, "Protocol is required")
      .refine(
        (v) => {
          const allowed = [
            "TCP personnalisé",
            "UDP personnalisé",
            "ICMP personnalisé",
            "Autre protocole",
            "Tout ICMP",
            "Tout TCP",
            "Tout UDP",
            "DNS",
            "HTTPS",
            "IMAP",
            "IMAPS",
            "LDAP",
            "MS SQL",
            "MySQL",
            "POP3",
            "POP3S",
            "RDP",
            "SMTP",
            "SMTPS",
            "SSH",
          ];
          return allowed.includes(v) || /^(tcp|udp|icmp)$/i.test(v);
        },
        {
          message:
            "Protocol must be one of the documented values or tcp/udp/icmp",
        },
      ),
    port_range_min: z.number().int().optional(),
    port_range_max: z.number().int().optional(),
    remote_ip_prefix: z
      .string()
      .regex(
        /^(\d{1,3}\.){3}\d{1,3}(\/([0-9]|[1-2][0-9]|3[0-2]))?$/,
        "Invalid CIDR format",
      )
      .default("0.0.0.0/0"),
  })
  .refine(
    (v) =>
      v.port_range_min === undefined ||
      v.port_range_max === undefined ||
      v.port_range_min <= v.port_range_max,
    {
      path: ["port_range_max"],
      message: "port_range_max must be >= port_range_min",
    },
  );

export const LoginRequestSchema = z.object({
  username: z.string().min(1, "Username is required").trim(),
  password: z.string().min(1, "Password is required"),
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
  flavor_id: z.string().min(1, "Flavor ID is required"),
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

export const CreateFromDescriptionRequestSchema = z.object({
  description: z.string().min(1, "Description is required").trim(),
  vm_name: z
    .string()
    .min(1, "VM name is required")
    .max(63, "VM name too long")
    .regex(
      /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/,
      "VM name must start and end with alphanumeric characters",
    )
    .trim(),
  timeout: z.number().int().min(1).default(300).optional(),
});

export const InstanceActionRequestSchema = z.object({
  instance_id: z.uuid("Invalid instance ID format"),
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
    .min(3, "Username must be at least 3 characters")
    .max(64, "Username too long")
    .trim(),
  email: z
    .email("Invalid email format")
    .max(254, "Email too long")
    .toLowerCase()
    .optional(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(128, "Password too long"),
  project_id: z.uuid("Invalid project ID format").optional(),
  roles: z.array(z.string().min(1, "Role name cannot be empty")).optional(),
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
  flavor_id: z.string().min(1, "Flavor ID is required"),
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

export const ImportVMwareRequestSchema = z.object({
  vm_name: z
    .string()
    .min(1, "VM name is required")
    .max(63, "VM name too long")
    .regex(
      /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/,
      "VM name must start and end with alphanumeric characters",
    )
    .trim(),
  description: z.string().trim().optional(),
  min_disk: z.number().int("Minimum disk size must be an integer").optional(),
  min_ram: z.number().int("Minimum RAM must be an integer").optional(),
  is_public: z.boolean().optional(),
  flavor_id: z.string().min(1, "Flavor ID is required"),
  network_id: z.uuid("Invalid network ID format"),
  key_name: z
    .string()
    .min(1, "Key pair name is required")
    .max(64, "Key pair name too long"),
  security_group: z
    .string()
    .min(1, "Security group is required")
    .max(64, "Security group name too long"),
  admin_password: z.string().optional(),
  vmdk_file: z
    .instanceof(File)
    .refine(
      (file) => file.name.toLowerCase().endsWith(".vmdk"),
      "File must be a .vmdk VMDK file",
    ),
});

export const ScaleNodeRequestSchema = z.object({
  ip: z
    .string()
    .regex(/^(?:\d{1,3}\.){3}\d{1,3}$/, "Invalid IP address format")
    .refine(
      (ip) =>
        ip.split(".").every((oct) => {
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

export const NetworkCreateRequestSchema = z.object({
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

export const KeyPairCreateRequestSchema = z.object({
  name: z
    .string()
    .min(1, "Key pair name is required")
    .max(64, "Key pair name too long")
    .regex(
      /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/,
      "Key pair name must start with alphanumeric character",
    )
    .trim(),
  key_type: z.enum(["ssh", "x509"]).optional(),
});

export const KeyPairImportFromFileRequestSchema = z.object({
  name: z
    .string()
    .min(1, "Key pair name is required")
    .max(64, "Key pair name too long")
    .regex(
      /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/,
      "Key pair name must start with alphanumeric character",
    )
    .trim(),
  public_key: z.instanceof(File, { message: "Public key file is required" }),
});

export const KeyPairDeleteRequestSchema = z.object({
  name: z
    .string()
    .min(1, "Key pair name is required")
    .max(64, "Key pair name too long")
    .trim(),
});

export const VolumeDeleteRequestSchema = z.object({
  volume_id: z.uuid("Invalid volume ID format"),
});

export const VolumeExtendRequestSchema = z.object({
  new_size: z
    .number()
    .int("Size must be an integer")
    .min(1, "New size must be at least 1 GB"),
});

export const VolumeChangeTypeRequestSchema = z.object({
  volume_type: z
    .string()
    .min(1, "Volume type is required")
    .max(64, "Volume type name too long"),
});

export const VolumeAttachRequestSchema = z.object({
  volume_id: z.uuid("Invalid volume ID format"),
  instance_id: z.uuid("Invalid instance ID format"),
});

export const VolumeDetachRequestSchema = z.object({
  attachment_id: z.uuid("Invalid attachment ID format"),
});

export const VolumeSnapshotDeleteRequestSchema = z.object({
  snapshot_id: z.uuid("Invalid snapshot ID format"),
});

export const VolumeCreateFromSnapshotRequestSchema = z.object({
  name: z
    .string()
    .min(1, "Volume name is required")
    .max(64, "Volume name too long")
    .trim(),
  description: z.string().max(255, "Description too long").trim().optional(),
  snapshot_id: z.uuid("Invalid snapshot ID format"),
  volume_type: z.string().max(64).optional(),
  availability_zone: z.string().max(64).optional(),
});

export const VolumeSnapshotUpdateRequestSchema = z.object({
  name: z
    .string()
    .min(1, "Snapshot name is required")
    .max(64, "Snapshot name too long")
    .trim()
    .optional(),
  description: z.string().max(255, "Description too long").trim().optional(),
});

export const VolumeUploadToImageRequestSchema = z.object({
  image_name: z
    .string()
    .min(1, "Image name is required")
    .max(64, "Image name too long")
    .trim(),
  disk_format: z.enum(["raw", "qcow2", "vmdk", "vdi"]).optional(),
  container_format: z.enum(["bare", "ovf", "ova"]).optional(),
  visibility: z.enum(["private", "public"]).optional(),
  protected: z.boolean().optional(),
});

export const VolumeTypeCreateRequestSchema = z.object({
  name: z
    .string()
    .min(1, "Volume type name is required")
    .max(64, "Volume type name too long")
    .trim(),
  description: z.string().max(255, "Description too long").trim().optional(),
  is_public: z.boolean().optional(),
});

export const VolumeTypeUpdateRequestSchema = z.object({
  volume_type_id: z.uuid("Invalid volume type ID format"),
  name: z
    .string()
    .min(1, "Volume type name is required")
    .max(64, "Volume type name too long")
    .trim()
    .optional(),
  description: z.string().max(255, "Description too long").trim().optional(),
});

export const InstanceStartRequestSchema = z.object({
  server_id: z.uuid("Invalid server ID format"),
});

export const InstanceStopRequestSchema = z.object({
  server_id: z.uuid("Invalid server ID format"),
});

export const InstanceRebootRequestSchema = z.object({
  server_id: z.uuid("Invalid server ID format"),
  type: z.enum(["SOFT", "HARD"]).optional(),
});

export const InstanceDeleteRequestSchema = z.object({
  server_id: z.uuid("Invalid server ID format"),
});

export const ResizeRequestSchema = z.object({
  instance_id: z.uuid("Invalid instance ID format"),
  new_flavor: z.string().min(1, "New flavor is required"),
});

export const IdRequestSchema = z.object({
  instance_id: z.uuid("Invalid instance ID format"),
});

export const FloatingIPRequestSchema = z.object({
  instance_id: z.uuid("Invalid instance ID format"),
});

export const InterfaceRequestSchema = z.object({
  instance_id: z.uuid("Invalid instance ID format"),
  network_id: z.uuid("Invalid network ID format"),
});

export const VolumeRequestSchema = z.object({
  instance_id: z.uuid("Invalid instance ID format"),
  volume_id: z.uuid("Invalid volume ID format"),
});

export const CreateSnapshotRequestSchema = z.object({
  instance_id: z.uuid("Invalid instance ID format"),
  snapshot_name: z.string().min(1, "Snapshot name is required").max(64).trim(),
});

export const SecurityGroupDeleteRequestSchema = z.object({
  security_group_id: z.uuid("Invalid security group ID format"),
});

export const SecurityGroupRuleDeleteRequestSchema = z.object({
  rule_id: z.uuid("Invalid rule ID format"),
});

export const SecurityGroupUpdateRequestSchema = z.object({
  name: z
    .string()
    .min(1, "Security group name is required")
    .max(64, "Security group name too long")
    .trim()
    .optional(),
  description: z.string().max(255, "Description too long").trim().optional(),
});

export const ImageDeleteRequestSchema = z.object({
  image_id: z.uuid("Invalid image ID format"),
});

export const ImageUpdateRequestSchema = z.object({
  new_name: z
    .string()
    .min(1, "Image name is required")
    .max(64, "Image name too long")
    .regex(
      /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/,
      "Image name must start with alphanumeric character",
    )
    .trim()
    .optional(),
  visibility: z.enum(["public", "private", "shared", "community"]).optional(),
  protected: z.boolean().optional(),
});

export const ImageImportFromUploadRequestSchema = z.object({
  file: z.instanceof(File, { message: "Image file is required" }),
  image_name: z
    .string()
    .min(1, "Image name is required")
    .max(64, "Image name too long")
    .trim(),
  visibility: z.enum(["private", "public"]).default("private").optional(),
  protected: z.boolean().optional(),
});

export const ImageCreateVolumeRequestSchema = z.object({
  name: z
    .string()
    .min(1, "Volume name is required")
    .max(64, "Volume name too long")
    .trim(),
  size: z
    .number()
    .int("Size must be an integer")
    .min(1, "Size must be at least 1 GB"),
  image_id: z.uuid("Invalid image ID format"),
  volume_type: z.string().max(64).optional(),
  visibility: z
    .enum(["private", "public", "shared", "community"])
    .default("private")
    .optional(),
  protected: z.boolean().default(false).optional(),
});

export const NetworkDeleteRequestSchema = z.object({
  network_id: z.uuid("Invalid network ID format"),
});

export const RouterDeleteRequestSchema = z.object({
  router_id: z.uuid("Invalid router ID format"),
});

export const ClusterNodeConfigSchema = z.object({
  name_prefix: z.string(),
  image_id: z.uuid("Invalid image ID format"),
  flavor_id: z.string(),
  network_id: z.uuid("Invalid network ID format"),
  security_group: z.string(),
  key_name: z.string(),
});

export const ClusterCreateRequestSchema = z.object({
  name: z.string(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,128}$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character",
    )
    .optional(),
  nombremaster: z
    .number()
    .int("Master count must be an integer")
    .min(1, "At least 1 master node is required"),
  nombreworker: z
    .number()
    .int("Worker count must be an integer")
    .min(0, "Worker count cannot be negative"),
  node_config: ClusterNodeConfigSchema,
});
