// ============================================================================
// Generic & Utility Interfaces
// ============================================================================

type ServiceStatus = "enabled" | "disabled";
type ServiceState = "up" | "down";

export type InstanceStatus =
  | "ACTIVE"
  | "SHUTOFF"
  | "BUILD"
  | "ERROR"
  | "SUSPENDED"
  | "PAUSED"
  | "SHELVED"
  | "RESCUE"
  | "DELETED";

interface ProjectInfo {
  project_id: string;
  project_name: string;
  roles: string[];
}

interface NetworkReference {
  uuid: string;
}

// ============================================================================
// AuthService Interfaces
// ============================================================================

/**
 * @service AuthService
 * @endpoint POST /auth/login
 * @function login
 */
export interface LoginResponse {
  token: string;
  user_id: string;
  username: string;
  projects: ProjectInfo[];
  expires_at: string;
  expires_at_ts: number;
  message: string;
}

/**
 * @service AuthService
 * @endpoint GET /auth/projects
 * @function getProjects
 */
export interface ProjectsResponse {
  projects: ProjectInfo[];
}

/**
 * @service AuthService
 * @endpoint POST /auth/logout
 * @function logout
 */
export interface LogoutResponse {
  message: string;
}

// ============================================================================
// VolumeService Interfaces
// ============================================================================

/**
 * @service VolumeService
 * @endpoint GET /volume/volumes
 * @function list
 */
export interface VolumeDetails {
  ID: string;
  Name: string;
  Description: string;
  Size: string;
  Status: string;
  Group: string;
  Type: string;
  "Attached To": string;
  "Availability Zone": string;
  Bootable: string;
  Encrypted: string;
}

export type VolumeListResponse = VolumeDetails[];

/**
 * @service VolumeService
 * @endpoint GET /volume/volumes/{volumeId}
 * @function get
 */
export interface VolumeGetDetails {
  Nom: string;
  ID: string;
  Description: string;
  Projet: string;
  Statut: string;
  Groupe: string;
  Spécifications: {
    Taille: string;
    Type: string;
    Amorçable: string;
    Chiffré: string;
    Créé: string;
  };
  Attachements: {
    "Attaché à": string;
  };
  Métadonnées: Record<string, unknown> | string;
}

/**
 * @service VolumeService
 * @remark Generic response for actions like create, delete, extend, etc.
 */
export interface VolumeActionResponse {
  message: string;
  [key: string]: unknown;
}

/**
 * @service VolumeService
 * @endpoint GET /volume/volumes/{volumeId}/available-instances
 * @function getAvailableInstances
 */
export interface VolumeAvailableInstancesResponse {
  volume_id: string;
  volume_name: string;
  available_instances: Array<{
    id: string;
    name: string;
    status: string;
  }>;
}

/**
 * @service VolumeService
 * @endpoint GET /volume/volumes/{volumeId}/attached-instances
 * @function getAttachedInstances
 */
export interface VolumeAttachedInstancesResponse {
  volume_id: string;
  volume_name: string;
  attached_instances: Array<{
    id: string;
    name: string;
    status: string;
    device: string;
  }>;
}

/**
 * @service VolumeService
 * @endpoint GET /volume/volumes/{volumeId}/attachement
 * @function getAttachments
 */
export interface VolumeAttachmentsDetailsResponse {
  volume_id: string;
  volume_name: string;
  attachments: Array<{
    attachment_id: string;
    server_id: string;
    server_name: string;
    device: string;
    host: string;
    attached_at: string;
  }>;
}

/**
 * @service VolumeService
 * @endpoint GET /volume/snapshots
 * @function listSnapshots
 */
interface VolumeSnapshot {
  ID: string;
  Name: string;
  Description: string;
  "Volume Name": string;
  Status: string;
  Size: string;
}

export type VolumeSnapshotListResponse = VolumeSnapshot[];

/**
 * @service VolumeService
 * @endpoint GET /volume/snapshots/{snapshotId}
 * @function getSnapshotDetails
 */
export interface VolumeSnapshotDetails {
  ID: string;
  Name: string;
  Description: string;
  "Project Name": string;
  Status: string;
  "Volume ID": string;
  "Volume Name": string;
  "Group Snapshot": string;
  Size: string;
  Created: string;
  Metadata: Record<string, unknown>;
}

/**
 * @service VolumeService
 * @endpoint GET /volume/volume-types/list
 * @function listVolumeTypes
 */
export interface VolumeType {
  ID: string;
  Name: string;
  Description: string;
  Is_Public: boolean;
}

export type VolumeTypeListResponse = VolumeType[];

// ============================================================================
// FlavorService Interfaces
// ============================================================================

/**
 * @service FlavorService
 * @endpoint GET /flavor/flavors
 *  @endpoint GET /flavor/flavors/{flavorId}
 * @function list
 * @function get
 */
export interface FlavorDetails {
  id: string;
  name: string;
  ram: number;
  vcpus: number;
  disk: number;
  ephemeral: number;
  swap: number;
  is_public: boolean;
}

export type FlavorListResponse = FlavorDetails[];

/**
 * @service FlavorService
 * @remark Generic response for actions like delete.
 */
export interface FlavorActionResponse {
  message: string;
  status: string;
}

// ============================================================================
// ImageService Interfaces
// ============================================================================

/**
 * @service ImageService
 * @endpoint GET /image/images
 * @function listImages
 */
export interface Image {
  id: string;
  name: string;
  status: string;
  visibility: "public" | "private" | "shared" | "community";
  protected: boolean;
}

export type ImageListResponse = Image[];

/**
 * @service ImageService
 * @endpoint GET /image/images/{imageId}
 * @function getImageDetails
 */
export interface ImageDetails extends Image {
  disk_format: string;
  container_format: string;
  size: number;
}

/**
 * @service ImageService
 * @endpoint DELETE /image/images/{image_id}
 * @function deleteImage
 */
export interface ImageDeleteResponse {
  message: string;
}

/**
 * @service ImageService
 * @endpoint POST /image/images/import-from-upload
 * @function importFromUpload
 */
export interface ImageImportFromUploadResponse {
  message: string;
  image_id: string;
  format: string;
}

/**
 * @service ImageService
 * @endpoint POST /image/images/import-from-url
 * @function importFromUrl
 */
export interface ImageImportFromUrlResponse {
  message: string;
  image_id: string;
  format: string;
}

/**
 * @service ImageService
 * @endpoint POST /image/images/import-from-name
 * @function importFromName
 */
export interface ImageImportFromNameResponse
  extends ImageImportFromUrlResponse {
  source_url: string;
}

// ============================================================================
// InfraService (Nova) Interfaces
// ============================================================================

/**
 * @service InfraService
 * @endpoint GET /nova/instances
 * @function listInstances
 */
export interface InstanceListItem {
  id: string;
  instance_name: string;
  image_name: string;
  has_volume: boolean;
  ip_address: string;
  flavor: string;
  key_pair: string;
  status: InstanceStatus;
  availability_zone: string;
  task: string;
  power_state: string;
  age: string;
  floating_ip: string;
}

export type InstanceListResponse = InstanceListItem[];

/**
 * @service InfraService
 * @endpoint GET /nova/servers/{instanceId}
 * @function getInstanceDetails
 */
export interface InstanceDetailsResponse {
  id: string;
  name: string;
  status: string;
  locked: boolean;
  project_id: string;
  created_at: string;
  host: string;
  flavor: {
    name: string;
    ram: string;
    vcpus: number;
    disk: string;
  };
  image: {
    name: string;
    id: string;
  };
  networks: Array<{
    network: string;
    ip: string;
    type: string;
  }>;
  security_groups: string[];
  volumes: Array<{
    id: string;
    name: string;
    size: string;
  }>;
  floating_ips: unknown[];
}

/**
 * @service InfraService
 * @endpoint POST /nova/create-vm
 * @function createVM
 */
export interface VMCreateResponse {
  status: "success";
  server: {
    id: string;
    name: string;
    status: string;
    admin_username: string;
    admin_password: string;
    ssh_key: string;
    floating_ip: string;
  };
}

/**
 * @service InfraService
 * @endpoint POST /nova/create-from-description
 * @function createFromDescription
 */
export interface CreateFromDescriptionResponse {
  status: "success";
  server_id: string;
  server_name: string;
  image_source: string;
  flavor: string;
  networks: NetworkReference[];
  security_groups: string[];
  admin_username: string;
  admin_password: string;
  floating_ip: string;
}

/**
 * @service InfraService
 * @endpoint GET /nova/check-qemu-img
 * @function checkQemuImg
 */
export interface QemuImgCheckResponse {
  installed: boolean;
  version?: string;
}

/**
 * @service InfraService
 * @endpoint POST /nova/import-vmware-vm
 * @function importVMwareVM
 */
export interface VMwareImportResponse {
  status: "success";
  image: {
    id: string;
    name: string;
  };
  server: {
    id: string;
    name: string;
    status: string;
    floating_ip: string;
  };
}

/**
 * @service InfraService
 * @endpoint GET /nova/resources
 * @function listResources
 */
export interface ResourcesResponse {
  images: ResourceImage[];
  flavors: ResourceFlavor[];
  networks: ResourceNetwork[];
  keypairs: ResourceKeypair[];
  security_groups: ResourceSecurityGroup[];
}

/**
 * @service InfraService
 * @remark Generic response for actions like start, stop, reboot, delete, etc.
 */
export interface NovaActionResponse {
  message: string;
}

/**
 * @service InfraService
 * @endpoint GET /dashboard/overview
 * @function getOverview
 */
export interface DashboardOverviewResponse {
  platform_info: PlatformInfo;
  resources: Resources;
  compute_services: ComputeService[];
  network_services: NetworkServiceStatus[];
}

/**
 * @service InfraService
 * @endpoint GET /nova/console
 * @function getConsole
 */
export interface ConsoleResponse {
  url: string;
}

/**
 * @service InfraService
 * @endpoint GET /nova/logs
 * @function getLogs
 */
export interface GetLogsResponse {
  logs: {
    output: string;
  };
}

/**
 * @service InfraService
 * @endpoint GET /nova/volumes_avaible/list
 * @function listAvailableVolumes
 */
interface VolumeListItem {
  id: string;
  name: string;
}

export type AvailableVolumesResponse = VolumeListItem[];

/**
 * @service InfraService
 * @endpoint POST /nova/volumes/attached
 * @function listAttachedVolumes
 */
export type AttachedVolumesResponse = VolumeListItem[];

// ============================================================================
// SecurityGroupService Interfaces
// ============================================================================

/**
 * @service SecurityGroupService
 * @endpoint GET /securitygroups/security-groups
 * @function list
 */
export interface SecurityGroup {
  Name: string;
  "Security Group ID": string;
  Description: string;
  Shared: boolean;
}

export type SecurityGroupListResponse = SecurityGroup[];

/**
 * @service SecurityGroupService
 * @endpoint POST /securitygroups/security-groups
 * @function create
 */
export interface SecurityGroupCreateResponse {
  id: string;
  name: string;
  description: string;
  project_id?: string;
}

/**
 * @service SecurityGroupService
 * @endpoint DELETE /securitygroups/security-groups/{security_group_id}
 * @function delete
 */
export interface SecurityGroupDeleteResponse {
  message: string;
}

/**
 * @service SecurityGroupService
 * @endpoint GET /securitygroups/security-groups/{securityGroupId}/rules
 * @function listRules
 */
export interface SecurityGroupRule {
  ID: string;
  Direction: string;
  "Ether Type": string;
  "IP Protocol": string;
  "Port Range": string;
  "Remote IP Prefix": string;
  "Remote Security Group": string;
  Description: string;
}

export type SecurityGroupRuleListResponse = {
  "Security Group": string;
  "Security Group ID": string;
  Rules: SecurityGroupRule[];
};

/**
 * @service SecurityGroupService
 * @endpoint POST /securitygroups/security-groups/{securityGroupId}/rules
 * @function addRule
 */
export interface SecurityGroupRuleCreateResponse {
  id: string;
  security_group_id: string;
  message?: string;
}

// ============================================================================
// ProjectService Interfaces
// ============================================================================

/**
 * @service ProjectService
 * @endpoint GET /projects/
 * @function list
 */
export interface Project {
  id: string;
  name: string;
  description: string;
  domain_id: string;
  enabled: boolean;
  user_count: number;
}

export type ProjectListResponse = Project[];

/**
 * @service ProjectService
 * @endpoint GET /projects/{projectId}
 * @function get
 */
export interface ProjectDetailsResponse extends Project {
  assignments: UserAssignment[];
}

export interface UserAssignment {
  user_id: string;
  user_name: string;
  roles: UserRole[];
}

export interface UserRole {
  role_id: string;
  role_name: string;
}

/**
 * @service ProjectService
 * @endpoint GET /projects/{projectId}/unassigned_users
 * @function getUnassignedUsers
 */
interface UnassignedUser {
  user_id: string;
  user_name: string;
}

export type UnassignedUsersResponse = UnassignedUser[];

/**
 * @service ProjectService
 * @endpoint POST /projects/assign-user
 * @function assignUser
 */
export interface AssignUserResponse {
  message: string;
  user_id: string;
  project_id: string;
  roles_assigned: string[];
}

/**
 * @service ProjectService
 * @endpoint POST /projects/remove-user
 * @function removeUser
 */
export interface RemoveUserResponse {
  message: string;
  user_id: string;
  project_id: string;
  roles_removed: string[];
}

/**
 * @service ProjectService
 * @endpoint PUT /projects/update-user-roles
 * @function updateUserRoles
 */
export interface UpdateUserRolesResponse {
  message: string;
  user_id: string;
  project_id: string;
  roles_assigned: string[];
}

/**
 * @service ProjectService
 * @endpoint DELETE /projects/{projectId}
 * @function delete
 */
export interface ProjectDeleteResponse {
  message: string;
}

// ============================================================================
// UserService Interfaces
// ============================================================================

/**
 * @service UserService
 * @endpoint POST /users/users
 * @function create
 */
export interface UserCreateResponse {
  id: string;
  name: string;
}

/**
 * @service UserService
 * @endpoint GET /users/users
 * @function list
 */
interface User {
  id: string;
  name: string;
  project: string;
  domain: string;
  email: string;
  enabled: boolean;
}

export type UserListResponse = User[];

/**
 * @service UserService
 * @endpoint GET /users/users/{userId}
 * @function get
 */
export interface UserDetailsResponse {
  id: string;
  name: string;
  email: string;
  enabled: boolean;
  default_project_id: string;
  projects: ProjectInfo[];
}

/**
 * @service UserService
 * @endpoint DELETE /users/users/{userId}
 * @function delete
 */
export interface UserDeleteResponse {
  message: string;
}

/**
 * @service UserService
 * @endpoint GET /users/roles
 * @function getRoles
 */
interface Role {
  id: string;
  name: string;
}

export type RolesResponse = Role[];

/**
 * @service UserService
 * @endpoint GET /users/debug_role_assignments/{userId}
 * @function debugRoleAssignments
 */
export interface DebugRoleAssignmentsResponse {
  user_id: string;
  assignments: Array<{
    project_id: string;
    project_name?: string;
    roles: string[];
  }>;
}

// ============================================================================
// NetworkService Interfaces
// ============================================================================

/**
 * @service NetworkService
 * @endpoint GET /network/list
 * @function list
 */
export interface NetworkListItem {
  id: string;
  name: string;
  subnets: string[];
  shared: boolean;
  external: boolean;
  status: string;
  admin_state: boolean;
  availability_zones: string[];
}

export type NetworkListResponse = NetworkListItem[];

/**
 * @service NetworkService
 * @endpoint GET /network/networks/{network_id}
 * @function get
 */
export interface NetworkDetails {
  id: string;
  name: string;
  project_name: string;
  status: string;
  is_admin_state_up: boolean;
  shared: boolean;
  is_external: boolean;
  mtu: number;
  provider: {
    network_type: string;
    physical_network: string | null;
    segmentation_id: number | null;
  };
  subnets: Subnets[];
}
interface Subnets {
  name: string;
  cidr: string;
}

/**
 * @service NetworkService
 * @endpoint POST /network/networks/create
 * @function create
 */
export interface NetworkCreateResponse {
  message: string;
}

/**
 * @service NetworkService
 * @endpoint DELETE /network/delete/{network_id}
 * @function delete
 */
export interface NetworkDeleteResponse {
  message: string;
}

/**
 * @service NetworkService
 * @endpoint GET /network/networks/public
 * @endpoint GET /network/networks/private
 * @function publicNetworks, privateNetworks
 */
interface PublicPrivateNetworkItem {
  id: string;
  name: string;
}

export type PublicPrivateNetworksResponse = PublicPrivateNetworkItem[];

/**
 * @service NetworkService
 * @endpoint POST /network/router/create
 * @function createRouter
 */
export interface RouterCreateResponse {
  id: string;
  name: string;
}

/**
 * @service NetworkService
 * @endpoint GET /network/routers
 * @function routersList
 */
export interface RouterListItem {
  id: string;
  name: string;
  status: string;
  external_network_name: string;
  external_ip: string;
  admin_state: boolean;
  availability_zones: string[];
}

export type RouterListResponse = RouterListItem[];

/**
 * @service NetworkService
 * @endpoint GET /network/router/{router_id}/
 * @function getRouter
 */

export interface RouterDetails {
  id: string;
  name: string;
  description: string;
  project_name: string;
  status: string;
  admin_state_up: boolean;
  availability_zones: string[];
  external_gateway_info: {
    network_id: string;
    external_fixed_ips: Array<{
      subnet_id: string;
      ip_address: string;
    }>;
    enable_snat: boolean;
  };
}

/**
 * @service NetworkService
 * @endpoint GET /network/router/{router_id}/interfaces
 * @function getRouterInterfaces
 */

interface RouterInterface {
  port_id: string;
  ip_address: string;
  network_name: string;
  type: string;
  status: string;
}

export type RouterInterfacesResponse = RouterInterface[];

/**
 * @service NetworkService
 * @endpoint GET /network/floatingips
 * @function listFloatingIPs
 */
export interface FloatingIpsListItem {
  id: string;
  ip_address: string;
  description: string;
  mapped_fixed_ip_address: string | null;
  vm_name: string | null;
  pool: string;
  status: string;
  associated: boolean;
}

export type FloatingIpsListResponse = FloatingIpsListItem[];

/**
 * @service NetworkService
 * @endpoint GET /network/vms
 * @function listVMS
 */
interface VMListItems {
  vm_id: string;
  vm_name: string;
}

export type VMListResponse = VMListItems[];

// ============================================================================
// ScaleService Interfaces
// ============================================================================

/**
 * @service ScaleService
 * @endpoint GET /scale/
 * @function health
 */
export interface ScaleHealthResponse {
  status: string;
}

/**
 * @service ScaleService
 * @endpoint POST /scale/node
 * @function addNode
 */
export interface ScaleNodeResponse {
  message: string;
  hostname: string;
  ip: string;
  deploy_tag: string;
  logs?: string;
}

// ============================================================================
// KeyPairService Interfaces
// ============================================================================

/**
 * @service KeyPairService
 * @endpoint GET /keypairs/keypairs
 * @function list
 */
interface KeyPairs {
  name: string;
  type: string;
}

export type KeyPairListResponse = KeyPairs[];

/**
 * @service KeyPairService
 * @endpoint GET /keypairs/keypairs/{name}
 * @function get
 */
export interface KeyPairDetails {
  name: string;
  type: string;
  fingerprint: string;
  public_key: string;
}

/**
 * @service KeyPairService
 * @endpoint POST /keypairs/keypairs/create
 * @function create
 */
export interface KeyPairCreateResponse {
  message: string;
  keypair: KeyPairs;
  private_key?: string;
}

/**
 * @service KeyPairService
 * @endpoint POST /keypairs/keypairs/import-from-file
 * @function importFromFile
 */
export interface KeyPairImportResponse {
  message: string;
  keypair: KeyPairs;
}

/**
 * @service KeyPairService
 * @endpoint DELETE /keypairs/keypairs/{name}
 * @function delete
 */
export interface KeyPairDeleteResponse {
  message: string;
  status: string;
}

// ============================================================================
// ClusterService Interfaces
// ============================================================================

/**
 * @service ClusterService
 * @remark Generic response for actions like create, start, stop, delete.
 */
export interface ClusterActionResponse {
  message?: string;
  [key: string]: unknown;
}

/**
 * @service ClusterService
 * @endpoint GET /cluster/clusters
 * @function list
 */
export interface ClusterListResponse {
  clusters: Clusters[];
}

export interface Clusters {
  cluster_id: number;
  cluster_name: string;
  overall_status: string;
  created_at: string | null;
  master_count: number;
  worker_count: number;
}

/**
 * @service ClusterService
 * @endpoint GET /cluster/clusters/{clusterId}
 * @function get
 */
export interface ClusterDetails {
  cluster_id: number;
  cluster_name: string;
  nodes: NodeInfo[];
  created_at: string | null;
  overall_status: string;
}

export interface NodeInfo {
  id: string;
  name: string;
  role: string;
  status: string;
  ssh_key: string;
  floating_ip: string;
}

/**
 * @service ClusterService
 * @endpoint GET /cluster/k8s-dashboard/token
 * @function getDashboardToken
 */
export interface ClusterDashboardTokenResponse {
  cluster_id: number;
  master_ip: string;
  token: string;
  dashboard_path: string;
  kubeconfig: string;
}

// ============================================================================
// Helper Interfaces (Not directly tied to a service)
// ============================================================================

interface ResourceImage {
  id: string;
  name: string;
}

interface ResourceFlavor {
  id: string;
  name: string;
  ram: number;
  vcpus: number;
  disk: number;
  ephemeral: number;
  swap: number;
  is_public: boolean;
  extra_specs: Record<string, unknown>;
}

interface ResourceNetwork {
  id: string;
  name: string;
}

interface ResourceKeypair {
  name: string;
}

interface ResourceSecurityGroup {
  name: string;
}

interface PlatformInfo {
  nodes: number;
  projects: number;
  users: number;
  hypervisor_errors: string[];
}

interface InstanceResources {
  total: number;
  ACTIVE: number;
  OTHERS: number;
}

interface VolumeResources {
  total: number;
  available: number;
  OTHERS: number;
}

interface CpuResources {
  used: number;
  total: number;
  unused: number;
  usage_percent: number;
  note?: string;
}

interface RamResources {
  used: number;
  total: number;
  unused: number;
  usage_percent: number;
  note?: string;
}

interface Resources {
  instances: InstanceResources;
  volumes: VolumeResources;
  cpu: CpuResources;
  ram: RamResources;
}

interface ComputeService {
  name: string;
  host: string;
  status: ServiceStatus;
  state: ServiceState;
}

interface NetworkServiceStatus {
  name: string;
  host: string;
  alive: boolean;
}
