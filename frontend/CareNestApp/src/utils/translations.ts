export type TranslationKey = keyof typeof translations.vi;

export const translations = {
  vi: {
    // Common
    cancel: 'Hủy',
    confirm: 'Xác nhận',
    save: 'Lưu',
    edit: 'Sửa',
    loading: 'Đang tải...',
    error: 'Lỗi',
    success: 'Thành công',

    // Profile Settings
    accountInfo: 'Thông tin tài khoản',
    personalInfo: 'Thông tin cá nhân',
    notificationSettings: 'Cài đặt thông báo',
    appSettings: 'Ứng dụng',
    support: 'Hỗ trợ',

    // Profile Fields
    fullName: 'Họ và tên',
    email: 'Email',
    phone: 'Số điện thoại',
    emergencyPhone: 'Số điện thoại khẩn cấp',
    optionalField: 'Để trống nếu chưa có',
    dateOfBirth: 'Ngày sinh',
    gender: 'Giới tính',
    bloodType: 'Nhóm máu',
    medicalRecord: 'Hồ sơ y tế',
    medicalHistory: 'Tiền sử bệnh',
    allergy: 'Dị ứng',
    height: 'Chiều cao',
    weight: 'Cân nặng',

    // Theme
    lightMode: 'Chế độ sáng',
    darkMode: 'Chế độ tối',
    theme: 'Giao diện',

    // Language
    language: 'Ngôn ngữ',
    vietnamese: 'Tiếng Việt',
    english: 'Tiếng Anh',
    selectLanguage: 'Chọn ngôn ngữ',
    languageChangeInfo: 'Thay đổi ngôn ngữ sẽ áp dụng cho toàn bộ ứng dụng.',

    // Privacy
    privacyPolicy: 'Chính sách bảo mật',

    // Support
    supportCenter: 'Trung tâm hỗ trợ',
    reportBug: 'Báo cáo sự cố',

    // Notifications
    medicineReminder: 'Nhắc uống thuốc',
    appointmentReminder: 'Nhắc lịch tái khám',

    // Medical
    viewMedicalInfo: 'Xem tiền sử, dị ứng và nhóm máu',

    // Logout
    logout: 'Đăng xuất tài khoản',
    logoutConfirm: 'Bạn có chắc chắn muốn đăng xuất?',

    // Alerts
    successMessage: 'Thành công',
    infoUpdated: 'Thông tin của bạn đã được cập nhật.',
    failedToSave: 'Không thể lưu',
    anErrorOccurred: 'Đã có lỗi xảy ra',
    emptyInfoAlert: 'Thiếu thông tin',
    pleaseProvideFullInfo:
      'Vui lòng nhập đầy đủ họ tên, email, số điện thoại và mật khẩu.',
    invalidBirthday: 'Ngày sinh chưa hợp lệ',
    pleaseSelectValidBirthday: 'Vui lòng chọn ngày sinh hợp lệ.',
    missingPhone: 'Thiếu số điện thoại',
    pleaseProvideValidPhone: 'Vui lòng nhập số điện thoại hợp lệ.',
    viewMode: 'Chế độ xem',
    clickEditToEnableEditing: 'Bấm Sửa để bật chỉnh sửa thông tin tài khoản.',
    notYetSupported: 'Chưa hỗ trợ',
    avatarFeatureNotReady:
      'Tính năng đổi ảnh đại diện sẽ được kết nối khi backend upload ảnh sẵn sàng.',

    // Home
    welcome: 'Chào mừng',
    home: 'Trang chủ',
    family: 'Gia đình',
    medicine: 'Thuốc',
    aiChat: 'AI Chat',
    profile: 'Hồ sơ',

    // Auth
    login: 'Đăng nhập',
    register: 'Đăng ký',
    forgotPassword: 'Quên mật khẩu',
    cannotLogin: 'Không thể đăng nhập',
    cannotRegister: 'Không thể đăng ký',
  },

  en: {
    // Common
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    edit: 'Edit',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',

    // Profile Settings
    accountInfo: 'Account Information',
    personalInfo: 'Personal Information',
    notificationSettings: 'Notification Settings',
    appSettings: 'Application',
    support: 'Support',

    // Profile Fields
    fullName: 'Full Name',
    email: 'Email',
    phone: 'Phone Number',
    emergencyPhone: 'Emergency Phone',
    optionalField: 'Leave blank if not available',
    dateOfBirth: 'Date of Birth',
    gender: 'Gender',
    bloodType: 'Blood Type',
    medicalRecord: 'Medical Record',
    medicalHistory: 'Medical History',
    allergy: 'Allergy',
    height: 'Height',
    weight: 'Weight',

    // Theme
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
    theme: 'Theme',

    // Language
    language: 'Language',
    vietnamese: 'Vietnamese',
    english: 'English',
    selectLanguage: 'Select Language',
    languageChangeInfo: 'Language change will be applied to the entire application.',

    // Privacy
    privacyPolicy: 'Privacy Policy',

    // Support
    supportCenter: 'Support Center',
    reportBug: 'Report Bug',

    // Notifications
    medicineReminder: 'Medicine Reminder',
    appointmentReminder: 'Appointment Reminder',

    // Medical
    viewMedicalInfo: 'View medical history, allergies and blood type',

    // Logout
    logout: 'Logout',
    logoutConfirm: 'Are you sure you want to logout?',

    // Alerts
    successMessage: 'Success',
    infoUpdated: 'Your information has been updated.',
    failedToSave: 'Failed to Save',
    anErrorOccurred: 'An error occurred',
    emptyInfoAlert: 'Missing Information',
    pleaseProvideFullInfo:
      'Please provide full name, email, phone number and password.',
    invalidBirthday: 'Invalid Date of Birth',
    pleaseSelectValidBirthday: 'Please select a valid date of birth.',
    missingPhone: 'Missing Phone Number',
    pleaseProvideValidPhone: 'Please provide a valid phone number.',
    viewMode: 'View Mode',
    clickEditToEnableEditing:
      'Click Edit to enable account information editing.',
    notYetSupported: 'Not Yet Supported',
    avatarFeatureNotReady:
      'Avatar change feature will be available when backend is ready.',

    // Home
    welcome: 'Welcome',
    home: 'Home',
    family: 'Family',
    medicine: 'Medicine',
    aiChat: 'AI Chat',
    profile: 'Profile',

    // Auth
    login: 'Login',
    register: 'Register',
    forgotPassword: 'Forgot Password',
    cannotLogin: 'Cannot Login',
    cannotRegister: 'Cannot Register',
  },
};
