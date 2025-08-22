// ============================================================================
// AUTHENTICATION SERVICE
// ============================================================================

// POST /api/v1/auth/login
export interface LoginRequest {
  username: string;
  password: string;
}

// POST /api/v1/auth/switch-project
export interface SwitchProjectRequest {
  project_id: string;
}

// ============================================================================
// VOLUME SERVICE
// ============================================================================

// POST /api/v1/volume/volumes
export interface VolumeCreateRequest {
  name: string;
  size: number;
  description?: string;
  snapshot_id?: string;
  image_id?: string;
  volume_type?: string;
  availability_zone?: string;
  source_vol_id?: string;
  group_id?: string;
}

// PUT /api/v1/volume/volumes/{volume_id}/extend
export interface VolumeExtendRequest {
  volume_id: string;
  new_size: number;
}

// POST /api/v1/volume/volumes/{volume_id}/attach
export interface VolumeAttachRequest {
  volume_id: string;
  instance_id: string;
}

// POST /api/v1/volume/volumes/{volume_id}/detach
export interface VolumeDetachRequest {
  attachment_id: string;
}

// PUT /api/v1/volume/volumes/{volume_id}/change-type
export interface VolumeChangeTypeRequest {
  volume_type: string;
}

// POST /api/v1/volume/snapshots
export interface VolumeSnapshotCreateRequest {
  volume_id: string;
  name: string;
  description?: string;
  force?: boolean;
}

// POST /api/v1/volume/volumes/{volume_id}/upload-to-image
export interface VolumeUploadToImageRequest {
  volume_id: string;
  image_name: string;
  disk_format?: string;
  container_format?: string;
  visibility?: "private" | "public";
  protected?: boolean;
}

// ============================================================================
// FLAVOR SERVICE
// ============================================================================

// POST /api/v1/flavor/flavors
export interface FlavorCreateRequest {
  name: string;
  ram: number;
  vcpus: number;
  disk: number;
  ephemeral?: number;
  swap?: number;
  is_public?: boolean;
  extra_specs?: Record<string, unknown>;
}

// PUT /api/v1/flavor/flavors/{flavor_id}/full-update
export interface FlavorUpdateRequest {
  flavor_id: string;
  name?: string;
  vcpus?: number;
  ram?: number;
  disk?: number;
  ephemeral?: number;
  swap?: number;
  is_public?: boolean;
  description?: string;
}

// DELETE /api/v1/flavor/flavors/{flavor_id}
export interface FlavorDeleteRequest {
  flavor_id: string;
}

// ============================================================================
// IMAGE SERVICE
// ============================================================================

// POST /api/v1/image/images/import-from-upload
export interface ImageImportFromUploadRequest {
  file: File;
  image_name: string;
  visibility?: "private" | "public";
}

// POST /api/v1/image/volumes
export interface ImageCreateVolumeRequest {
  name: string;
  size: number; // in GB
  image_id: string;
  volume_type?: string;
  visibility?: "private" | "public" | "shared" | "community";
  protected?: boolean;
}

// POST /api/v1/image/images/import-from-name
export interface ImageImportFromNameRequest {
  description: string;
  visibility?: "private" | "public";
}

// POST /api/v1/image/images/import-from-url
export interface ImageImportFromUrlRequest {
  image_url: string;
  image_name: string;
  visibility?: "private" | "public";
}

// PUT /api/v1/image/images/{image_id}
export interface ImageUpdateRequest {
  name?: string;
  visibility?: "public" | "private" | "shared" | "community";
  protected?: boolean;
  tags?: string[];
}

// ============================================================================
// NOVA/COMPUTE SERVICE
// ============================================================================

// POST /api/v1/nova/create-vm
export interface VMCreateRequest {
  name: string;
  image_id: string;
  flavor_id: string;
  network_id: string;
  key_name: string;
  security_group: string;
  admin_password?: string;
  admin_username?: string;
}

// POST /api/v1/nova/create-from-description
export interface CreateFromDescriptionRequest {
  description: string;
  vm_name?: string;
  timeout?: number;
}

// POST /api/v1/nova/import-vmware-vm
export interface ImportVMwareRequest {
  vm_name: string;
  description?: string;
  min_disk?: number;
  min_ram?: number;
  is_public?: boolean;
  flavor_id: string;
  network_id: string;
  key_name: string;
  security_group: string;
  admin_password?: string;
  vmdk_file: File;
}

// GET /api/v1/nova/instances/{instance_id}
export interface InstanceActionRequest {
  instance_id: string;
}

// POST /api/v1/nova/start, /api/v1/nova/stop, /api/v1/nova/reboot, /api/v1/nova/delete
export interface NovaActionRequest {
  server_id: string;
}

// ============================================================================
// SECURITY GROUP SERVICE
// ============================================================================

// POST /api/v1/securitygroups/security-groups
export interface SecurityGroupCreateRequest {
  name: string;
  description?: string;
  project_id?: string;
}

// POST /api/v1/securitygroups/security-groups/{security_group_id}/rules
export interface SecurityGroupRuleCreateRequest {
  security_group_id: string;
  direction: "ingress" | "egress";
  ethertype: "IPv4" | "IPv6";
  protocol?: string;
  port_range_min?: number;
  port_range_max?: number;
  remote_ip_prefix?: string;
  remote_group_id?: string;
  description?: string;
}

// PUT /api/v1/securitygroups/security-groups/{security_group_id}
export interface SecurityGroupUpdateRequest {
  name?: string;
  description?: string;
}

// ============================================================================
// PROJECT SERVICE
// ============================================================================

// POST /api/v1/projects
export interface ProjectCreateRequest {
  name: string;
  description?: string;
  domain_id?: string;
  enabled: boolean;
  assignments?: ProjectAssignment[];
}

export interface ProjectAssignment {
  user_id: string;
  roles: string[];
}

// PUT /api/v1/projects/{project_id}
export interface ProjectUpdateRequest {
  name?: string;
  description?: string;
  enabled?: boolean;
}

// POST /api/v1/projects/assign-user
export interface AssignUserToProjectRequest {
  user_id: string;
  project_id: string;
  role_names: string[];
}

// POST /api/v1/projects/remove-user
export interface RemoveUserFromProjectRequest {
  user_id: string;
  project_id: string;
}

// PUT /api/v1/projects/update-user-roles
export interface UpdateUserRolesRequest {
  user_id: string;
  project_id: string;
  role_ids: string[];
}

// ============================================================================
// USER SERVICE
// ============================================================================

// POST /api/v1/users/users
export interface UserCreateRequest {
  name: string;
  email?: string;
  password: string;
  project_id?: string;
  roles?: string[];
}

// PUT /api/v1/users/users/{user_id}
export interface UserUpdateRequest {
  name?: string;
  email?: string;
  password?: string;
  enabled?: boolean;
  projects?: UserProjectAssignment[];
}

interface UserProjectAssignment {
  project_id: string;
  roles: string[];
}

// ============================================================================
// NETWORK SERVICE
// ============================================================================

// POST /api/v1/network/networks/create
export interface NetworkCreateRequest {
  name: string;
  description: string;
  mtu: number;
  shared: boolean;
  port_security_enabled: boolean;
  availability_zone_hints: string[];
  subnet: SubnetCreateRequest;
}

interface SubnetCreateRequest {
  name: string;
  ip_version: 4 | 6;
  cidr: string;
  gateway_ip: string;
  enable_dhcp: boolean;
  allocation_pools: AllocationPool[];
  dns_nameservers: string[];
  host_routes: string[];
}

export interface AllocationPool {
  start: string;
  end: string;
}

// POST /api/v1/network/router/create
export interface RouterCreateRequest {
  router_name: string;
  external_network_id: string;
}

// POST /api/v1/network/router/{router_id}/add-interface
export interface RouterAddInterfaceRequest {
  subnet_id: string;
}

// ============================================================================
// SCALE SERVICE
// ============================================================================

// POST /api/v1/scale/node
export interface ScaleNodeRequest {
  ip: string;
  hostname: string;
  type: "control" | "compute" | "storage";
  neutron_external_interface: string;
  network_interface: string;
  ssh_user: string;
  ssh_password: string;
  deploy_tag: string;
}

// ============================================================================
// DASHBOARD SERVICE
// ============================================================================

// No request interfaces needed - dashboard endpoints are GET only

// ============================================================================
// FORM DATA INTERFACES (UI SPECIFIC)
// ============================================================================

export interface FlavorFormData {
  flavor_id: string;
}

export interface ImageFormData {
  image_id: string;
}

export interface NetworkFormData {
  network_id: string;
  key_name: string;
  security_group: string;
}

export interface VMDetailsFormData {
  name: string;
  admin_username: string;
  admin_password: string;
}

export interface CombinedVMData
  extends FlavorFormData,
    ImageFormData,
    NetworkFormData,
    VMDetailsFormData {}

// ============================================================================
// MISSING INTERFACES FROM API ANALYSIS
// ============================================================================

// Volume service missing interfaces
export interface VolumeDeleteRequest {
  volume_id: string;
}

// DELETE /volume/snapshots/{snapshot_id}
export interface VolumeSnapshotDeleteRequest {
  snapshot_id: string;
}

// POST /volume/snapshots/{snapshot_id}/create-volume
export interface VolumeCreateFromSnapshotRequest {
  name: string;
  description?: string;
  snapshot_id: string;
  volume_type?: string;
  availability_zone?: string;
}

// PUT /volume/snapshots/{snapshot_id}
export interface VolumeSnapshotUpdateRequest {
  name?: string;
  description?: string;
}

// ============================================================================
// VOLUME TYPES
// ============================================================================

// POST /volume/types
export interface VolumeTypeCreateRequest {
  name: string;
  description?: string;
  is_public?: boolean;
}

// PUT /volume/types/{volume_type_id}
export interface VolumeTypeUpdateRequest {
  volume_type_id: string;
  name?: string;
  description?: string;
}

// Security group missing interfaces
export interface SecurityGroupDeleteRequest {
  security_group_id: string;
}

export interface SecurityGroupRuleDeleteRequest {
  rule_id: string;
}

// Image service missing interfaces
export interface ImageDeleteRequest {
  image_id: string;
}

// Network service missing interfaces
export interface NetworkDeleteRequest {
  network_id: string;
}

export interface RouterDeleteRequest {
  router_id: string;
}

// Instance management missing interfaces
export interface InstanceStartRequest {
  server_id: string;
}

export interface InstanceStopRequest {
  server_id: string;
}

export interface InstanceRebootRequest {
  server_id: string;
  type?: "SOFT" | "HARD";
}

export interface InstanceDeleteRequest {
  server_id: string;
}

// KeyPairs service interfaces
// POST /keypairs/keypairs/create
export interface KeyPairCreateRequest {
  name: string;
  key_type?: string;
}

// POST /keypairs/keypairs/import-from-file
export interface KeyPairImportFromFileRequest {
  name: string;
  public_key: File;
}

// DELETE /keypairs/keypairs/{name}
export interface KeyPairDeleteRequest {
  name: string;
}
