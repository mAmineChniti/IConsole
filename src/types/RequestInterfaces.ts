// src/types/RequestInterfaces.ts

// ============================================================================
// AuthService Interfaces
// ============================================================================

/**
 * @service AuthService
 * @endpoint POST /auth/login
 * @function login
 */
export interface LoginRequest {
  username: string;
  password: string;
}

/**
 * @service AuthService
 * @endpoint POST /auth/switch-project
 * @function switchProject
 */
export interface SwitchProjectRequest {
  project_id: string;
}

// ============================================================================
// VolumeService Interfaces
// ============================================================================

/**
 * @service VolumeService
 * @endpoint POST /volume/volumes
 * @function create
 */
export interface VolumeCreateRequest {
  name: string;
  size: number;
  description?: string;
  volume_type?: string;
  availability_zone?: string;
  source_vol_id?: string;
  group_id?: string;
}

/**
 * @service VolumeService
 * @endpoint POST /volume/volumes/{volume_id}/extend
 * @function extend
 */
export interface VolumeExtendRequest {
  volume_id: string;
  new_size: number;
}

/**
 * @service VolumeService
 * @endpoint POST /volume/volumes/{volume_id}/attach
 * @function attach
 */
export interface VolumeAttachRequest {
  volume_id: string;
  instance_id: string;
}

/**
 * @service VolumeService
 * @endpoint DELETE /volume/volumes/attachments/{attachment_id}
 * @function detach
 */
export interface VolumeDetachRequest {
  attachment_id: string;
}

/**
 * @service VolumeService
 * @endpoint PUT /volume/volumes/{volume_id}/type
 * @function changeType
 */
export interface VolumeChangeTypeRequest {
  volume_type: string;
}

/**
 * @service VolumeService
 * @endpoint POST /volume/snapshots
 * @function createSnapshot
 */
export interface VolumeSnapshotCreateRequest {
  volume_id: string;
  name: string;
  description?: string;
}

/**
 * @service VolumeService
 * @endpoint POST /volume/volumes/{volume_id}/upload-to-image
 * @function uploadToImage
 */
export interface VolumeUploadToImageRequest {
  volume_id: string;
  image_name: string;
  disk_format?: "raw" | "qcow2" | "vmdk" | "vdi";
  container_format?: "bare" | "ovf" | "ova";
}

/**
 * @service VolumeService
 * @endpoint DELETE /volume/volumes/{volume_id}
 * @function delete
 */
export interface VolumeDeleteRequest {
  volume_id: string;
}

/**
 * @service VolumeService
 * @endpoint DELETE /volume/snapshots/{snapshot_id}
 * @function deleteSnapshot
 */
export interface VolumeSnapshotDeleteRequest {
  snapshot_id: string;
}

/**
 * @service VolumeService
 * @endpoint POST /volume/volumes (from snapshot)
 * @function createVolumeFromSnapshot
 */
export interface VolumeCreateFromSnapshotRequest {
  name: string;
  description?: string;
  snapshot_id: string;
  volume_type?: string;
  availability_zone?: string;
}

/**
 * @service VolumeService
 * @endpoint PUT /volume/snapshots/{snapshot_id}
 * @function updateSnapshot
 */
export interface VolumeSnapshotUpdateRequest {
  name?: string;
  description?: string;
}

/**
 * @service VolumeService
 * @endpoint POST /volume/volume-types/create
 * @function createVolumeType
 */
export interface VolumeTypeCreateRequest {
  name: string;
  description?: string;
  is_public?: boolean;
}

/**
 * @service VolumeService
 * @endpoint PUT /volume/volume-types/update/
 * @function updateVolumeType
 */
export interface VolumeTypeUpdateRequest {
  volume_type_id: string;
  name?: string;
  description?: string;
}

// ============================================================================
// FlavorService Interfaces
// ============================================================================

/**
 * @service FlavorService
 * @endpoint POST /flavor/flavors
 * @function create
 */
export interface FlavorCreateRequest {
  name: string;
  ram: number;
  vcpus: number;
  disk?: number;
  ephemeral?: number;
  swap?: number;
  is_public?: boolean;
}

/**
 * @service FlavorService
 * @endpoint PUT /flavor/flavors/
 * @function update
 */
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

/**
 * @service FlavorService
 * @endpoint DELETE /flavor/flavors/{flavor_id}
 * @function delete
 */
export interface FlavorDeleteRequest {
  flavor_id: string;
}

// ============================================================================
// ImageService Interfaces
// ============================================================================

/**
 * @service ImageService
 * @endpoint POST /image/images/import-from-upload
 * @function importFromUpload
 */
export interface ImageImportFromUploadRequest {
  file: File;
  image_name: string;
  visibility?: "private" | "public";
}

/**
 * @service ImageService
 * @endpoint POST /image/volumes
 * @function createVolume
 */
export interface ImageCreateVolumeRequest {
  name: string;
  size: number;
  image_id: string;
  volume_type?: string;
  visibility?: "private" | "public" | "shared" | "community";
  protected?: boolean;
}

/**
 * @service ImageService
 * @endpoint POST /image/images/import-from-name
 * @function importFromName
 */
export interface ImageImportFromNameRequest {
  description: string;
  visibility?: "private" | "public";
  protected: boolean;
}

/**
 * @service ImageService
 * @endpoint POST /image/images/import-from-url
 * @function importFromUrl
 */
export interface ImageImportFromUrlRequest {
  image_url: string;
  image_name: string;
  visibility?: "private" | "public";
}

/**
 * @service ImageService
 * @endpoint PUT /image/images/{imageId}/update
 * @function updateImage
 */
export interface ImageUpdateRequest {
  new_name?: string;
  visibility?: "public" | "private" | "shared" | "community";
  protected?: boolean;
}

/**
 * @service ImageService
 * @endpoint DELETE /image/images/{image_id}
 * @function deleteImage
 */
export interface ImageDeleteRequest {
  image_id: string;
}

// ============================================================================
// InfraService (Nova) Interfaces
// ============================================================================

/**
 * @service InfraService
 * @endpoint POST /nova/create-vm
 * @function createVM
 */
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

/**
 * @service InfraService
 * @endpoint POST /nova/create-from-description
 * @function createFromDescription
 */
export interface CreateFromDescriptionRequest {
  description: string;
  vm_name: string;
  timeout?: number;
}

/**
 * @service InfraService
 * @endpoint POST /nova/import-vmware-vm
 * @function importVMwareVM
 */
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

/**
 * @service InfraService
 * @endpoint POST /nova/start
 * @function startInstance
 */
export interface InstanceStartRequest {
  server_id: string;
}

/**
 * @service InfraService
 * @endpoint POST /nova/stop
 * @function stopInstance
 */
export interface InstanceStopRequest {
  server_id: string;
}

/**
 * @service InfraService
 * @endpoint POST /nova/reboot
 * @function rebootInstance
 */
export interface InstanceRebootRequest {
  server_id: string;
}

/**
 * @service InfraService
 * @endpoint POST /nova/delete
 * @function deleteInstance
 */
export interface InstanceDeleteRequest {
  server_id: string;
}

/**
 * @service InfraService
 * @endpoint POST /nova/resize
 * @function resize
 */
export interface ResizeRequest {
  instance_id: string;
  new_flavor: string;
}

/**
 * @service InfraService
 * @endpoint POST /nova/snapshot
 * @function createSnapshot
 */
export interface CreateSnapshotRequest {
  instance_id: string;
  snapshot_name: string;
}

/**
 * @service InfraService
 * @endpoint POST /nova/pause, /nova/suspend, /nova/shelve, /nova/rescue
 * @endpoint GET /nova/console, /nova/logs
 * @function pause, suspend, shelve, rescue, getConsole, getLogs
 */
export interface IdRequest {
  instance_id: string;
}

/**
 * @service InfraService
 * @endpoint POST /nova/attach, /nova/detach
 * @function attachFloatingIp, detachFloatingIp
 */
export interface FloatingIPRequest {
  instance_id: string;
}

/**
 * @service InfraService
 * @endpoint POST /nova/interface/attach, /nova/interface/detach
 * @function attachInterface, detachInterface
 */
export interface InterfaceRequest {
  instance_id: string;
  network_id: string;
}

/**
 * @service InfraService
 * @endpoint POST /nova/volume/attach, /nova/volume/detach
 * @function attachVolume, detachVolume
 */
export interface VolumeRequest {
  instance_id: string;
  volume_id: string;
}

// ============================================================================
// SecurityGroupService Interfaces
// ============================================================================

/**
 * @service SecurityGroupService
 * @endpoint POST /securitygroups/security-groups
 * @function create
 */
export interface SecurityGroupCreateRequest {
  name: string;
  description?: string;
}

/**
 * @service SecurityGroupService
 * @endpoint POST /securitygroups/security-groups/{securityGroupId}/rules
 * @function addRule
 */
export interface SecurityGroupRuleCreateRequest {
  security_group_id: string;
  direction: "ingress" | "egress";
  ethertype?: "IPv4" | "IPv6";
  protocol: string;
  port_range_min?: number;
  port_range_max?: number;
  remote_ip_prefix?: string;
}

/**
 * @service SecurityGroupService
 * @endpoint PUT /securitygroups/security-groups/{securityGroupId}
 * @function update
 */
export interface SecurityGroupUpdateRequest {
  name?: string;
  description?: string;
}

/**
 * @service SecurityGroupService
 * @endpoint DELETE /securitygroups/security-groups/{security_group_id}
 * @function delete
 */
export interface SecurityGroupDeleteRequest {
  security_group_id: string;
}

/**
 * @service SecurityGroupService
 * @endpoint DELETE /securitygroups/security-groups/rules/{rule_id}
 * @function deleteRule
 */
export interface SecurityGroupRuleDeleteRequest {
  rule_id: string;
}

// ============================================================================
// ProjectService Interfaces
// ============================================================================

/**
 * @service ProjectService
 * @endpoint POST /projects
 * @function create
 */
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

/**
 * @service ProjectService
 * @endpoint PUT /projects/{projectId}
 * @function update
 */
export interface ProjectUpdateRequest {
  name?: string;
  description?: string;
  enabled?: boolean;
}

/**
 * @service ProjectService
 * @endpoint POST /projects/assign-user
 * @function assignUser
 */
export interface AssignUserToProjectRequest {
  user_id: string;
  project_id: string;
  role_names: string[];
}

/**
 * @service ProjectService
 * @endpoint POST /projects/remove-user
 * @function removeUser
 */
export interface RemoveUserFromProjectRequest {
  user_id: string;
  project_id: string;
}

/**
 * @service ProjectService
 * @endpoint PUT /projects/update-user-roles
 * @function updateUserRoles
 */
export interface UpdateUserRolesRequest {
  user_id: string;
  project_id: string;
  role_ids: string[];
}

// ============================================================================
// UserService Interfaces
// ============================================================================

/**
 * @service UserService
 * @endpoint POST /users/users
 * @function create
 */
export interface UserCreateRequest {
  name: string;
  email?: string;
  password: string;
  project_id?: string;
  roles?: string[];
}

/**
 * @service UserService
 * @endpoint PUT /users/users/{userId}
 * @function update
 */
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
// NetworkService Interfaces
// ============================================================================

/**
 * @service NetworkService
 * @endpoint POST /network/networks/create
 * @function create
 */
export interface NetworkCreateRequest {
  name: string;
  description?: string;
  mtu: number;
  shared: boolean;
  port_security_enabled: boolean;
  is_external: boolean;
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

/**
 * @service NetworkService
 * @endpoint POST /network/router/create
 * @function createRouter
 */
export interface RouterCreateRequest {
  router_name: string;
  external_network_id: string;
}

/**
 * @service NetworkService
 * @endpoint POST /network/router/attach-private-network
 * @function attachPrivateNetwork
 */
export interface AttachPrivateNetworkRequest {
  router_id: string;
  private_network_id: string;
}

/**
 * @service NetworkService
 * @endpoint GET /network/networks/{network_id}
 * @function get
 * @endpoint DELETE /network/delete/{network_id}
 * @function delete
 */
export interface NetworkIdRequest {
  network_id: string;
}

/**
 * @service NetworkService
 * @endpoint GET /network/router/{router_id}
 * @endpoint POST /network/router/{router_id}/interfaces
 * @function getRouter, getRouterInterfaces
 */
export interface RouterIdRequest {
  router_id: string;
}

/**
 * @service NetworkService
 * @endpoint POST /network/floatingips/delete
 * @function deleteFloatingIP
 * @endpoint POST /network/floatingips/dissociate
 * @function dissociateFloatingIP
 */
export interface FloatingIPIdRequest {
  floating_ip_id: string;
}

/**
 * @service NetworkService
 * @endpoint POST /network/router/remove-interface
 * @function removeRouterInterface
 */
export interface RemoveRouterInterfaceRequest {
  router_id: string;
  network_name: string;
}

/**
 * @service NetworkService
 * @endpoint POST /network/floatingips/create
 * @function createFloatingIP
 */
export interface FloatingIPCreateRequest {
  external_network_name: string;
  floating_ip?: string;
  description?: string;
}

/**
 * @service NetworkService
 * @endpoint POST /network/floatingips/associate
 * @function associateFloatingIP
 */
export interface FloatingIPAssociateRequest {
  floating_ip_id: string;
  vm_id: string;
}

// ============================================================================
// ScaleService Interfaces
// ============================================================================

/**
 * @service ScaleService
 * @endpoint POST /scale/node
 * @function addNode
 */
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
// KeyPairService Interfaces
// ============================================================================

/**
 * @service KeyPairService
 * @endpoint POST /keypairs/keypairs/create
 * @function create
 */
export interface KeyPairCreateRequest {
  name: string;
  key_type?: "ssh" | "x509";
}

/**
 * @service KeyPairService
 * @endpoint POST /keypairs/keypairs/import-from-file
 * @function importFromFile
 */
export interface KeyPairImportFromFileRequest {
  name: string;
  public_key: File;
}

/**
 * @service KeyPairService
 * @endpoint DELETE /keypairs/keypairs/{name}
 * @function delete
 */
export interface KeyPairDeleteRequest {
  name: string;
}

// ============================================================================
// ClusterService Interfaces
// ============================================================================

/**
 * @service ClusterService
 * @endpoint POST /cluster/create-vm-cluster-auto
 * @function createAuto
 */
export interface ClusterCreateRequest {
  name: string;
  password?: string;
  nombremaster: number;
  nombreworker: number;
  node_config: ClusterNodeConfig;
}

interface ClusterNodeConfig {
  name_prefix: string;
  image_id: string;
  flavor_id: string;
  network_id: string;
  security_group: string;
  key_name: string;
}

/**
 * @service ClusterService
 * @endpoint GET /cluster/k8s-dashboard/token
 * @function getDashboardToken
 */
export interface ClusterTokenRequest {
  cluster_id: number;
}

/**
 * @service ClusterService
 * @endpoint POST /cluster/clusters/start
 * @endpoint POST /cluster/clusters/stop
 * @endpoint POST /cluster/clusters/delete
 * @function start, stop, delete
 */
export interface ClusterActionRequest {
  cluster_id: number;
}

// ============================================================================
// UI / Form-related Interfaces (Not direct API requests)
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
