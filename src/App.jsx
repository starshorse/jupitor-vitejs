import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { configureStore, createSlice } from '@reduxjs/toolkit';
// [추가] Key 아이콘 추가
import { Menu, X, LogOut, FileSpreadsheet, Users, Settings, BarChart3, Lock, Shield, Key } from 'lucide-react';
// [추가] 분리된 컴포넌트 import
import SpreadSheet from './components/SpreadSheet';
import AuthKey from './components/AuthKey'; // [신규] AuthKey import

// Redux Slices
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    isAuthenticated: false,
    user: null,
    token: null
  },
  reducers: {
    login: (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
    }
  }
});

const configSlice = createSlice({
  name: 'config',
  initialState: {
    theme: 'light',
    language: 'ko',
    itemsPerPage: 50,
    autoSave: true,
    notifications: true,
    apiEndpoint: '[https://api.ez-office.co.kr](https://api.ez-office.co.kr)',
    refreshInterval: 30000
  },
  reducers: {
    updateConfig: (state, action) => {
      return { ...state, ...action.payload };
    },
    resetConfig: (state) => {
      return {
        theme: 'light',
        language: 'ko',
        itemsPerPage: 50,
        autoSave: true,
        notifications: true,
        apiEndpoint: '[https://api.ez-office.co.kr](https://api.ez-office.co.kr)',
        refreshInterval: 30000
      };
    }
  }
});

// Redux Store
const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    config: configSlice.reducer
  }
});

const { login, logout } = authSlice.actions;
const { updateConfig, resetConfig } = configSlice.actions;

// --- Page Components ---

const DBManagementPage = () => {
  const user = useSelector((state) => state.auth.user);
  
  const headers = ['DB명', '사용자', '권한', '생성일', '상태', '비고'];
  const data = [
    ['DB_PROD_01', user?.email || 'admin@ez-office.co.kr', 'READ/WRITE', '2024-01-15', '활성', '프로덕션 DB'],
    ['DB_PROD_02', 'user@ez-office.co.kr', 'READ', '2024-02-20', '활성', '읽기 전용'],
    ['DB_TEST_01', 'dev@ez-office.co.kr', 'READ/WRITE', '2024-03-10', '비활성', '테스트 DB']
  ];

  return (
    <SpreadSheet 
      title="DB 권한관리"
      subTitle={`현재 사용자: ${user?.name} (${user?.email})`}
      headers={headers}
      data={data}
    />
  );
};

const WebAuthPage = () => {
  const headers = ['메뉴 ID', '메뉴명', 'URL', '읽기 권한', '쓰기 권한', '관리자 전용', '비고'];
  const columnWidths = [100, 150, 200, 100, 100, 100, 150];
  const data = [
    ['MENU_001', '대시보드', '/dashboard', '전체', '불가', 'X', '기본 페이지'],
    ['MENU_002', 'DB 권한관리', '/db-auth', '관리자', '관리자', 'O', '보안 주의'],
    ['MENU_003', '웹 권한관리', '/web-auth', '슈퍼관리자', '슈퍼관리자', 'O', '시스템 설정'],
    ['MENU_004', '서비스 설정', '/settings', '관리자', '관리자', 'O', '-'],
    ['MENU_005', '리포트', '/report', '전체', '불가', 'X', '조회 전용']
  ];

  return (
    <SpreadSheet 
      title="웹권한관리"
      subTitle="사용자별 웹 메뉴 접근 권한을 관리합니다."
      headers={headers}
      data={data}
      headerColor="#0f766e" // Teal 색상
      columnWidths={columnWidths}
    />
  );
};

// [수정] 고객키관리 페이지: AuthKey 컴포넌트 렌더링
const CustomerKeyPage = () => {
  return <AuthKey />;
};

const ServiceSettingsPage = () => {
  const config = useSelector((state) => state.config);
  const user = useSelector((state) => state.auth.user);

  return (
    <div>
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">서비스설정관리</h1>
        <p className="text-gray-600">서비스 설정을 관리합니다.</p>
      </div>

      <div className="grid gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">서비스 정보</h2>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">API 엔드포인트:</span>
              <span className="font-medium">{config.apiEndpoint}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">갱신 주기:</span>
              <span className="font-medium">{config.refreshInterval / 1000}초</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">알림 설정:</span>
              <span className="font-medium">{config.notifications ? '활성화' : '비활성화'}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">담당자:</span>
              <span className="font-medium">{user?.name}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">서비스 현황</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-green-600 text-sm font-medium">활성 서비스</div>
              <div className="text-2xl font-bold text-green-700 mt-2">12</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-yellow-600 text-sm font-medium">대기중</div>
              <div className="text-2xl font-bold text-yellow-700 mt-2">3</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-red-600 text-sm font-medium">비활성</div>
              <div className="text-2xl font-bold text-red-700 mt-2">1</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ServiceReportPage = () => {
  const config = useSelector((state) => state.config);
  const user = useSelector((state) => state.auth.user);

  return (
    <div>
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">서비스사항</h1>
        <p className="text-gray-600">서비스 리포트 및 통계를 확인합니다.</p>
      </div>

      <div className="grid gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">월별 사용 현황</h2>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
            <div className="text-gray-400">차트 영역 (Chart.js 연동 가능)</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">최근 활동</h2>
          <div className="space-y-3">
            {[
              { action: 'DB 권한 수정', user: user?.name, time: '5분 전' },
              { action: '새 사용자 추가', user: 'system', time: '1시간 전' },
              { action: '설정 변경', user: user?.name, time: '2시간 전' }
            ].map((log, i) => (
              <div key={i} className="flex justify-between items-center py-3 border-b last:border-0">
                <div>
                  <div className="font-medium">{log.action}</div>
                  <div className="text-sm text-gray-500">{log.user}</div>
                </div>
                <div className="text-sm text-gray-400">{log.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const ServiceAdminPage = () => {
  const config = useSelector((state) => state.config);
  const user = useSelector((state) => state.auth.user);

  return (
    <div>
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">서비스권한관리</h1>
        <p className="text-gray-600">사용자 권한을 관리합니다.</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">사용자</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">이메일</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">역할</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">상태</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">액션</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {[
              { name: user?.name, email: user?.email, role: 'Admin', status: '활성' },
              { name: '사용자1', email: 'user1@ez-office.co.kr', role: 'User', status: '활성' },
              { name: '사용자2', email: 'user2@ez-office.co.kr', role: 'User', status: '비활성' }
            ].map((u, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm">{u.name}</td>
                <td className="px-6 py-4 text-sm">{u.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    u.role === 'Admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    u.status === '활성' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {u.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button className="text-purple-600 hover:text-purple-800 text-sm">편집</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ConfigPage = () => {
  const dispatch = useDispatch();
  const config = useSelector((state) => state.config);
  const [localConfig, setLocalConfig] = useState(config);

  const handleSave = () => {
    dispatch(updateConfig(localConfig));
    alert('설정이 저장되었습니다.');
  };

  const handleReset = () => {
    dispatch(resetConfig());
    setLocalConfig(store.getState().config);
    alert('설정이 초기화되었습니다.');
  };

  return (
    <div>
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">환경 설정</h1>
        <p className="text-gray-600">시스템 설정을 관리합니다.</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              테마
            </label>
            <select
              value={localConfig.theme}
              onChange={(e) => setLocalConfig({...localConfig, theme: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="light">라이트</option>
              <option value="dark">다크</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              언어
            </label>
            <select
              value={localConfig.language}
              onChange={(e) => setLocalConfig({...localConfig, language: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="ko">한국어</option>
              <option value="en">English</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              페이지당 표시 행 수
            </label>
            <input
              type="number"
              value={localConfig.itemsPerPage}
              onChange={(e) => setLocalConfig({...localConfig, itemsPerPage: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API 엔드포인트
            </label>
            <input
              type="text"
              value={localConfig.apiEndpoint}
              onChange={(e) => setLocalConfig({...localConfig, apiEndpoint: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              갱신 주기 (밀리초)
            </label>
            <input
              type="number"
              value={localConfig.refreshInterval}
              onChange={(e) => setLocalConfig({...localConfig, refreshInterval: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="autoSave"
              checked={localConfig.autoSave}
              onChange={(e) => setLocalConfig({...localConfig, autoSave: e.target.checked})}
              className="mr-2"
            />
            <label htmlFor="autoSave" className="text-sm font-medium text-gray-700">
              자동 저장 활성화
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="notifications"
              checked={localConfig.notifications}
              onChange={(e) => setLocalConfig({...localConfig, notifications: e.target.checked})}
              className="mr-2"
            />
            <label htmlFor="notifications" className="text-sm font-medium text-gray-700">
              알림 활성화
            </label>
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-purple-700 text-white rounded-lg hover:bg-purple-800 transition-colors"
            >
              저장
            </button>
            <button
              onClick={handleReset}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              초기화
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Layout Component
const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state) => state.auth.user);

  const menuItems = [
    { id: 'db-management', label: 'DB 권한관리', icon: FileSpreadsheet, path: '/' },
    { id: 'web-auth', label: '웹권한관리', icon: Shield, path: '/web-auth' },
    { id: 'customer-key', label: '고객키관리', icon: Key, path: '/customer-keys' }, // [추가] 메뉴
    { id: 'service-settings', label: '서비스설정관리', icon: Settings, path: '/service-settings' },
    { id: 'service-report', label: '서비스사항', icon: BarChart3, path: '/service-report' },
    { id: 'service-admin', label: '서비스권한관리', icon: Users, path: '/service-admin' },
    { id: 'config', label: '환경 설정', icon: Settings, path: '/config' }
  ];

  const handleLogout = () => {
    if (window.confirm('로그아웃 하시겠습니까?')) {
      dispatch(logout());
      window.location.href = "http://localhost:5000/auth/logout"; // 백엔드 로그아웃 후 홈으로 리다이렉트됨
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 상단 네비게이션 */}
      <nav className="bg-white shadow-sm border-b fixed top-0 left-0 right-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="text-2xl font-bold text-purple-700">
                EZoffice
              </div>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg bg-purple-700 text-white hover:bg-purple-800 transition-colors"
              >
                <Menu size={20} />
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user?.name} ({user?.role})
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-purple-700 text-white rounded-lg hover:bg-purple-800 transition-colors flex items-center space-x-2"
              >
                <LogOut size={18} />
                <span>로그아웃</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex flex-1 pt-16">
        {/* 사이드바 */}
        <aside
          className={`fixed inset-y-0 left-0 z-30 w-80 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } mt-16`}
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">메뉴</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <ul className="space-y-2">
              {menuItems.map(item => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.id}>
                    <Link
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-purple-600 text-white'
                          : 'hover:bg-gray-800 text-gray-300'
                      }`}
                    >
                      <Icon size={20} />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>

        {/* 메인 컨텐츠와 푸터를 감싸는 래퍼 */}
        <div className={`flex flex-col flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-80' : 'ml-0'}`}>
            <main className="flex-1 p-6 w-full">
                <div className="w-full">
                    <Routes>
                    <Route path="/" element={<DBManagementPage />} />
                    <Route path="/web-auth" element={<WebAuthPage />} />
                    <Route path="/customer-keys" element={<CustomerKeyPage />} /> {/* [추가] 라우트 */}
                    <Route path="/service-settings" element={<ServiceSettingsPage />} />
                    <Route path="/service-report" element={<ServiceReportPage />} />
                    <Route path="/service-admin" element={<ServiceAdminPage />} />
                    <Route path="/config" element={<ConfigPage />} />
                    </Routes>
                </div>
            </main>

            {/* 푸터 */}
            <footer className="bg-gray-900 text-white mt-auto">
                <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid md:grid-cols-2 gap-8">
                    <div>
                    <h3 className="text-xl font-bold mb-3">EZoffice</h3>
                    <div className="space-y-2 text-gray-400 text-sm">
                        <p>📍 경기도 수원시 영통구 광교중앙로 248번길 95-5</p>
                        <p>📧 richard.choi@ez-office.co.kr</p>
                        <p>📞 070-7709-5512</p>
                    </div>
                    </div>
                    <div className="text-sm text-gray-400">
                    <p>© Ez Office 2022 all rights reserved</p>
                    </div>
                </div>
                </div>
            </footer>
        </div>
      </div>
    </div>
  );
};

// Login Component
const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@ez-office.co.kr');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    dispatch(login({
      user: {
        email: email,
        name: '관리자',
        role: 'admin'
      },
      token: 'demo-token-' + Date.now()
    }));
    navigate('/');
  };

  const handleGoogleLogin = () => {
    // 백엔드의 Google 인증 경로로 리다이렉트
    window.location.href = "http://localhost:5000/auth/google";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
            <Lock className="text-purple-700" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">EZoffice</h1>
          <p className="text-gray-600 mt-2">관리자 로그인</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              이메일
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="admin@ez-office.co.kr"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-purple-700 text-white rounded-lg hover:bg-purple-800 transition-colors font-semibold"
          >
            데모 로그인 (테스트용)
          </button>

          {/* 구분선 */}
          <div className="relative mt-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">또는</span>
            </div>
          </div>

          {/* Google 로그인 버튼 */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors flex items-center justify-center"
          >
             <svg className="h-5 w-5 mr-2" aria-hidden="true" viewBox="0 0 24 24">
                <path d="M12.0003 20.45c-4.6667 0-8.45-3.7833-8.45-8.45 0-4.6667 3.7833-8.45 8.45-8.45 2.2833 0 4.35 0.8333 5.9667 2.2167l-3.05 3.05c-0.8167-0.7833-1.9-1.2667-3.0167-1.2667-2.6167 0-4.7333 2.1167-4.7333 4.7333 0 2.6167 2.1167 4.7333 4.7333 4.7333 1.25 0 2.4-0.45 3.2667-1.1833 0.8667-0.7333 1.5-1.7833 1.7-2.95H12.0003v-4.05h9.35c0.1167 0.6667 0.2 1.3667 0.2 2.1167 0 2.8-1.0167 5.2333-2.8333 6.9667-1.7 1.6333-4.0167 2.6167-6.7167 2.6167z" fill="#EA4335" />
             </svg>
            Google 계정으로 로그인
          </button>
        </form>
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  // 앱 실행 시 백엔드 세션 체크 (새로고침 시 로그인 유지)
  useEffect(() => {
    const checkSession = async () => {
      try {
        // vite proxy가 /auth -> http://localhost:5000/auth 로 연결
        const response = await fetch('/auth/user', {
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        });
        
        if (response.ok) {
          const data = await response.json();
          // 세션이 유효하면 Redux 로그인 처리
          dispatch(login({
            user: data.user,
            token: 'session-cookie'
          }));
        }
      } catch (error) {
        console.log("세션 없음 (비로그인 상태)");
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, [dispatch]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* 로그인 상태면 홈으로, 아니면 로그인 페이지 보여줌 */}
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <LoginPage />} />
        
        {/* 보호된 라우트: 로그인 안되어있으면 /login으로 리다이렉트 */}
        <Route path="/*" element={isAuthenticated ? <MainLayout /> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
};

// Root Component with Redux Provider
const Root = () => {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  );
};

export default Root;

