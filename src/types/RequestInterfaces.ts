export interface LoginRequest {
  username: string;
  password: string;
}

export interface SwitchProjectRequest {
  project_id: string;
}

export interface VolumeCreateRequest {
  name: string;
  size: number;
  description?: string;
  volume_type?: string;
  availability_zone?: string;
  source_vol_id?: string;
  group_id?: string;
}

export interface VolumeExtendRequest {
  volume_id: string;
  new_size: number;
}

export interface VolumeAttachRequest {
  volume_id: string;
  instance_id: string;
}

export interface VolumeDetachRequest {
  attachment_id: string;
}

export interface VolumeChangeTypeRequest {
  volume_type: string;
}

export interface VolumeSnapshotCreateRequest {
  volume_id: string;
  name: string;
  description?: string;
}

export interface VolumeUploadToImageRequest {
  volume_id: string;
  image_name: string;
  disk_format?: string;
  container_format?: string;
  visibility?: "private" | "public";
  protected?: boolean;
}

export interface FlavorCreateRequest {
  name: string;
  ram: number;
  vcpus: number;
  disk?: number;
  ephemeral?: number;
  swap?: number;
  is_public?: boolean;
}

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

export interface FlavorDeleteRequest {
  flavor_id: string;
}

export interface ImageImportFromUploadRequest {
  file: File;
  image_name: string;
  visibility?: "private" | "public";
}

export interface ImageCreateVolumeRequest {
  name: string;
  size: number;
  image_id: string;
  volume_type?: string;
  visibility?: "private" | "public" | "shared" | "community";
  protected?: boolean;
}

export interface ImageImportFromNameRequest {
  description: string;
  visibility?: "private" | "public";
}

export interface ImageImportFromUrlRequest {
  image_url: string;
  image_name: string;
  visibility?: "private" | "public";
}

export interface ImageUpdateRequest {
  new_name?: string;
  visibility?: "public" | "private" | "shared" | "community";
  protected?: boolean;
}

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

export interface CreateFromDescriptionRequest {
  description: string;
  vm_name: string;
  timeout?: number;
}

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

export interface InstanceActionRequest {
  instance_id: string;
}

export interface NovaActionRequest {
  server_id: string;
}

export interface SecurityGroupCreateRequest {
  name: string;
  description?: string;
}

export interface SecurityGroupRuleCreateRequest {
  security_group_id: string;
  direction: "ingress" | "egress";

  ethertype?: "IPv4" | "IPv6";

  protocol: string;
  port_range_min?: number;
  port_range_max?: number;

  remote_ip_prefix?: string;
}

export interface SecurityGroupUpdateRequest {
  name?: string;
  description?: string;
}

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

export interface ProjectUpdateRequest {
  name?: string;
  description?: string;
  enabled?: boolean;
}

export interface AssignUserToProjectRequest {
  user_id: string;
  project_id: string;
  role_names: string[];
}

export interface RemoveUserFromProjectRequest {
  user_id: string;
  project_id: string;
}

export interface UpdateUserRolesRequest {
  user_id: string;
  project_id: string;
  role_ids: string[];
}

export interface UserCreateRequest {
  name: string;
  email?: string;
  password: string;
  project_id?: string;
  roles?: string[];
}

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

export interface RouterCreateRequest {
  router_name: string;
  external_network_id: string;
}

export interface RouterAddInterfaceRequest {
  subnet_id: string;
}

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

export interface VolumeDeleteRequest {
  volume_id: string;
}

export interface VolumeSnapshotDeleteRequest {
  snapshot_id: string;
}

export interface VolumeCreateFromSnapshotRequest {
  name: string;
  description?: string;
  snapshot_id: string;
  volume_type?: string;
  availability_zone?: string;
}

export interface VolumeSnapshotUpdateRequest {
  name?: string;
  description?: string;
}

export interface VolumeTypeCreateRequest {
  name: string;
  description?: string;
  is_public?: boolean;
}

export interface VolumeTypeUpdateRequest {
  volume_type_id: string;
  name?: string;
  description?: string;
}

export interface SecurityGroupDeleteRequest {
  security_group_id: string;
}

export interface SecurityGroupRuleDeleteRequest {
  rule_id: string;
}

export interface ImageDeleteRequest {
  image_id: string;
}

export interface NetworkDeleteRequest {
  network_id: string;
}

export interface RouterDeleteRequest {
  router_id: string;
}

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

export interface KeyPairCreateRequest {
  name: string;
  key_type?: "ssh" | "x509";
}

export interface KeyPairImportFromFileRequest {
  name: string;
  public_key: File;
}

export interface KeyPairDeleteRequest {
  name: string;
}

export interface ClusterNodeConfig {
  name_prefix: string;
  image_id: string;
  flavor_id: string;
  network_id: string;
  security_group: string;
  key_name: string;
}

export interface ClusterCreateRequest {
  name: string;
  password?: string;
  nombremaster: number;
  nombreworker: number;
  node_config: ClusterNodeConfig;
}

export interface ClusterTokenRequest {
  cluster_id: number;
}

export interface ClusterActionRequest {
  cluster_id: number;
}

export interface SSHHostPassword {
  host: string;
  password: string;
}

export interface ResizeRequest {
  instance_id: string;
  new_flavor: string;
}

export interface IdRequest {
  instance_id: string;
}

export interface FloatingIPRequest {
  instance_id: string;
}

export interface InterfaceRequest {
  instance_id: string;
  network_id: string;
}

export interface VolumeRequest {
  instance_id: string;
  volume_id: string;
}

export interface CreateSnapshotRequest {
  instance_id: string;
  snapshot_name: string;
}
