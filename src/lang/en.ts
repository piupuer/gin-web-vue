export default {
  langSelect: 'Language switching succeeded',
  login: 'Login',
  logout: 'Logout',
  hello: 'Hello',
  dashboard: 'Index',
  username: 'Username',
  password: 'Password',
  oldPassword: 'OldPassword',
  newPassword: 'NewPassword',
  confirmPassword: 'ConfirmPassword',
  initPassword: 'InitPassword',
  pleaseEnter: 'Please enter or select ',
  query: 'Search',
  reset: 'Reset',
  create: 'Create',
  update: 'Update',
  submit: 'Submit',
  recovery: 'recovery',
  congratulations: 'Congratulations',
  success: 'Success',
  fail: 'Fail',
  readDataFail: 'Read data fail',
  operation: 'Operation',
  hidden: 'Hidden',
  show: 'Show',
  available: 'Available',
  disabled: 'Disabled',
  edit: 'Edit',
  del: 'Delete',
  batchDel: 'Batch delete',
  permission: 'Permission',
  sureToDo: 'Are you sure you want to ',
  caution: 'Caution',
  irreversible: 'this operation is irreversible',
  confirm: 'Confirm',
  cancel: 'Cancel',
  noDiff: 'the data has not changed, please re-enter~',
  required: ' cannot be empty',
  createdAt: 'Create Time',
  updatedAt: 'Update Time',
  healthy: 'Healthy',
  yes: 'Yes',
  no: 'No',
  any: 'Any',
  alreadyExists: 'already exists',
  name: 'Name',
  title: 'Title',
  content: 'Content',
  status: 'Status',
  locked: 'Locked',
  unlock: 'Unlock',
  sort: 'Sort',
  keyword: 'Keyword',
  desc: 'Desc',
  icon: 'Icon',
  nickname: 'Nickname',
  mobile: 'Mobile',
  introduction: 'Introduction',
  message: 'Message',
  type: 'Type',
  category: 'Category',
  ip: 'Ip',
  port: 'Port',
  remark: 'Remark',
  refresh: 'Refresh',
  connect: 'Connect',
  loginPage: {
    title: 'Log In',
    captcha: 'Captcha',
    users: ['Super Admin', 'Guest', 'Leave Tester']
  },
  tagsBtn: {
    refresh: 'Refresh',
    close: 'Close',
    closeOthers: 'Close Others',
    closeAll: 'Close All'
  },
  settingsBtn: {
    title: 'Page style setting',
    theme: 'Theme Color',
    showTagsView: 'Open Tags-View',
    showSidebarLogo: 'Sidebar Logo',
    fixedHeader: 'Fixed Header',
    sidebarTextTheme: 'Sidebar Text Theme'
  },
  navbarBtn: {
    github: 'Github',
    docs: 'Docs',
    swagger: 'Swagger',
    theme: 'Theme',
    size: 'Size',
    profile: 'Profile',
    message: 'Message',
    loki: 'Loki(test/123456)',
    minio: 'Minio(minio/minio123)'
  },
  profilePage: {
    aboutMe: 'About Me',
    info: 'Account info',
    security: 'Account security',
    passwordInconsistent: 'The passwords entered twice are inconsistent',
    newPasswordSmallLen: 'The new password must be at least 6 characters long'
  },
  menuRoute: {
    dashboardRoot: 'Dashboard',
    dashboard: 'Dashboard',
    systemRoot: 'System Settings',
    menu: 'Menus',
    role: 'Roles',
    user: 'Users',
    api: 'Apis',
    operationLog: 'Operation Logs',
    messagePush: 'Message Push',
    machine: 'Machines',
    profile: 'User Profile',
    message: 'Message',
    fsmRoot: 'Fsm',
    fsm: 'Fsm Machines',
    leave: 'My Leaves',
    approving: 'Approving',
    testRoot: 'Test',
    test: 'Test Case',
    uploader: 'Uploader',
    uploader1: 'Uploader I',
    uploader2: 'Uploader II'
  },
  dashboardPage: {
    t1: 'Welcome to Gin Web',
    t2: 'Click the top left corner to expand the menu and try out various functions',
    t3: 'If you have any questions, please mention issue or join QQ group to communicate',
    t4: 'AD',
    t5: 'Do you need VPN?',
    t6: '50GB/month for free',
    t7: 'UCloud Server',
    t8: 'The minimum is only',
    t9: 'per year'
  },
  menu: 'Menu',
  menuPage: {
    path: 'URL path',
    rootPath: 'Root path',
    fullPath: 'Full path',
    component: 'Component path',
    redirect: 'Redirect URL',
    visible: 'Menu nav',
    breadcrumb: 'Breadcrumb nav',
    parentId: 'Parent Menu',
    topPath: 'Top'
  },
  role: 'Role',
  roleName: 'Role name',
  user: 'User',
  userPage: {
    validate: [
      'Must start with a letter, e.g. a12345',
      'Special characters are not allowed',
      'Incorrect mobile phone number format',
      'Username must be at least 4 characters',
      'Username up to 20 characters',
      'Init password must be at least 6 characters',
      'New password must be at least 6 characters'
    ]
  },
  api: 'Api',
  apiPage: {
    path: 'URL prefix',
    method: 'Method',
    showRoleTips: 'It can avoid adding in the role management page',
    showRoleSelect: 'Role permission',
    get: 'get resources',
    post: 'create resources',
    put: 'create or update resources',
    patch: 'create or update resources(incremental update)',
    delete: 'delete resources'
  },
  operationLog: 'Operation Log',
  operationLogPage: {
    apiDesc: 'Api description',
    ipLocation: 'IP location',
    latency: 'Request time',
    userAgent: 'Browser UserAgent',
    body: 'Request body',
    params: 'Request params',
    resp: 'Response data',
    showDetail: 'show detail'
  },
  messagePushPage: {
    sendNow: 'Send it',
    sendMessage: 'send message',
    toUser: 'to User',
    toRole: 'to Role',
    one2one: 'one to one',
    one2more: 'one to more',
    one2all: 'one to all',
    unRead: 'un read',
    read: 'read'
  },
  machine: 'Machine',
  host: 'Host',
  terminal: 'Terminal',
  machinePage: {
    cannotConnect: 'cannot connect',
    version: 'OS version',
    arch: 'OS architecture',
    name: 'Machine name',
    memory: 'Memory',
    disk: 'Disk'
  },
  fsm: 'Fsm',
  level: 'Level',
  fsmPage: {
    submitterName: 'Submitter Name',
    submitterEditFields: 'Submitter edit fields',
    submitterConfirm: 'Submitter confirm',
    submitterConfirmEditFields: 'Submitter confirm edit fields',
    edit: 'Edit permission',
    editFields: 'Edit fields',
    users: 'Approver user',
    roles: 'Approver roles',
    refuse: 'Refuse permission',
    validate: [
      'Category must be numeric',
      'Fill in at least one item for user or role'
    ]
  },
  leave: 'Leave',
  startTime: 'Start time',
  endTime: 'End time',
  approveLogTrack: 'Approve log track',
  leavePage: {
    flowName: 'Leave approval flow',
    submitted: 'Submitted',
    approved: 'Approved',
    refusedNeedResubmit: 'Refused, need resubmit',
    refusedNeedResubmitDesc: 'Please edit and resubmit~',
    cancelled: 'Cancelled',
    approving: 'Approving',
    approvingDesc: 'Please wait patiently~',
    approvedNeedConfirm: 'Approved, need confirm',
    approvedNeedConfirmDesc: 'Please click Confirm~'
  },
  approvingPage: {
    defaultOpinion: 'Approved',
    opinion: 'Approve opinion',
    reason: 'Reason',
    approve: 'Approve',
    refuse: 'Refuse',
    confirm: 'Confirm',
    resubmit: 'Resubmit',
    submitterUser: 'Submitter user',
    submitterRole: 'Submitter role',
    prevDetail: 'Status',
    logDetail: 'Submitter detail',
    viewLogDetail: 'view',
    doApproval: 'Approval',
    toApprove: 'Go to approve',
    toRefuse: 'Go to refuse'
  },
  upload: 'Upload',
  uploading: 'Uploading',
  paused: 'Paused',
  waiting: 'Waiting',
  decompress: 'Decompress',
  merged: 'Merged',
  uploaderPage: {
    drag: 'Drag files here to upload or',
    file: 'Select files',
    image: 'Select images',
    folder: 'Select folders',
    zip: 'Upload zip',
    startDecompress: 'Start decompress',
    uploaded: 'Uploaded',
    decompressed: 'Decompressed',
    validate: [
      'Please upload at least one file and unzip it~'
    ]
  },
  testCase: 'Test Case'
}
