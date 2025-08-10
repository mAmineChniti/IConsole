export interface LoginRequest {
  username: string;
  password: string;
}

export interface SwitchProjectRequest {
  project_id: string;
}

export interface VMCreateRequest {
  name: string;
  image_id: string;
  flavor_id: string;
  network_id: string;
  key_name: string;
  security_group: string;
  admin_password: string;
  admin_username: string;
}

export interface VMwareImportRequest {
  vm_name: string;
  description?: string;
  min_disk?: number;
  min_ram?: number;
  is_public?: boolean;
  flavor_id: string;
  network_id: string;
  key_name: string;
  security_group: string;
  admin_password: string;
  vmdk_file: File;
}

export interface CreateFromDescriptionRequest {
  description: string;
  vm_name?: string;
  timeout?: number;
}

export interface ProjectCreateRequest {
  name: string;
  description?: string;
  domain_id?: string;
  enabled: boolean;
  assignments: ProjectAssignment[];
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
  email: string;
  password: string;
  project_id?: string;
  roles: string[];
}

export interface UserUpdateRequest {
  name?: string;
  email?: string;
  password?: string;
  enabled?: boolean;
  projects?: UserProjectAssignment[];
}

export interface UserProjectAssignment {
  project_id: string;
  roles: string[];
}

export interface ImageImportFromUrlRequest {
  image_url: string;
  image_name: string;
  visibility?: "private" | "public";
}

export interface NetworkCreateRequest {
  name: string;
  description?: string;
  mtu?: number;
  shared?: boolean;
  port_security_enabled?: boolean;
  availability_zone_hints?: string[];
  subnet?: SubnetCreateRequest;
}

export interface SubnetCreateRequest {
  name: string;
  ip_version: number;
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

export interface ImportVMFormData {
  vm_name: string;
  description?: string;
  min_disk?: number;
  min_ram?: number;
  is_public: boolean;
  flavor_id: string;
  network_id: string;
  key_name: string;
  security_group: string;
  admin_password: string;
}

export interface CombinedVMData
  extends FlavorFormData,
    ImageFormData,
    NetworkFormData,
    VMDetailsFormData {}
