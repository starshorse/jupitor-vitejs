# jupitor-vitejs

[Edit in StackBlitz next generation editor ⚡️](https://stackblitz.com/~/github.com/starshorse/jupitor-vitejs)

React 19 프로젝트 생성 및 OAuth 2.0 코드 적용 가이드이 가이드는 기존에 작성된 OAuth 2.0 로그인 코드를 React 19 (Vite 기반) 환경에 맞춰 새로 생성하고 적용하는 절차를 다룹니다. 또한, 최신 Node.js 환경(ES Module)과 Passport 호환성 패치를 포함하고 있습니다.1단계: 프로젝트 구조 설정 (Backend)Node.js 백엔드를 최신 ES Module 환경으로 설정합니다.package.json 설정: server 폴더의 package.json에 "type": "module"을 추가해야 합니다.{
  "name": "server",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "cookie-session": "^2.0.0",
    "cors": "^2.8.5",
    "dotenv": "^16.0.0",
    "express": "^4.18.0",
    "passport": "^0.6.0",
    "passport-google-oauth20": "^2.0.0"
  }
}
server/server.js 작성: 아래 코드는 import 구문 사용 및 regenerate 오류 패치가 포함된 최종 버전입니다.import express from "express";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import cookieSession from "cookie-session";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// 1. CORS 설정 (Vite 기본 포트 5173 허용)
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);

// 2. 쿠키 세션 설정
app.use(
  cookieSession({
    name: "session",
    keys: [process.env.COOKIE_KEY || "secret_key"],
    maxAge: 24 * 60 * 60 * 1000,
  })
);

// 3. [중요] Passport 0.6+ 호환성 패치 미들웨어
// cookie-session에 없는 regenerate/save 메소드를 강제로 주입하여 오류 방지
app.use(function (request, response, next) {
  if (request.session && !request.session.regenerate) {
    request.session.regenerate = (cb) => {
      cb();
    };
  }
  if (request.session && !request.session.save) {
    request.session.save = (cb) => {
      cb();
    };
  }
  next();
});

// 4. Passport 초기화
app.use(passport.initialize());
app.use(passport.session());

// --- Mock Database & Passport Config ---
const users = [];

const verifyUser = async (googleId) => {
  return users.find((user) => user.googleId === googleId);
};

const insertUser = async (profile) => {
  const newUser = {
    googleId: profile.id,
    displayName: profile.displayName,
    email: profile.emails?.[0]?.value,
    provider: "google",
  };
  users.push(newUser);
  return newUser;
};

passport.serializeUser((user, done) => {
  done(null, user.googleId);
});

passport.deserializeUser(async (googleId, done) => {
  const user = await verifyUser(googleId);
  done(null, user);
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
      proxy: true,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const exUser = await verifyUser(profile.id);
        if (exUser) {
          return done(null, exUser);
        } else {
          const newUser = await insertUser(profile);
          return done(null, newUser);
        }
      } catch (err) {
        return done(err, false);
      }
    }
  )
);

// --- Routes ---
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: "http://localhost:5173", // React App URL
    failureRedirect: "/login/failed",
  })
);

app.get("/auth/user", (req, res) => {
  if (req.user) {
    res.status(200).json({ success: true, user: req.user });
  } else {
    res.status(401).json({ success: false, message: "Not logged in" });
  }
});

app.get("/auth/logout", (req, res) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("http://localhost:5173");
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
2단계: React 19 프로젝트 생성 (Vite 사용)create-react-app 대신 Vite를 사용합니다. Tailwind CSS 설치 과정이 포함되어 있습니다.프로젝트 생성 및 필수 라이브러리 설치:(Redux Toolkit, React Router, Lucide React 추가)주의: React 19와의 의존성 충돌 방지를 위해 --legacy-peer-deps 옵션을 사용하세요.npm create vite@latest client -- --template react
cd client
npm install
# Tailwind CSS v3 명시적 설치 (v4 오류 방지)
npm install -D tailwindcss@3 postcss autoprefixer
# 기타 라이브러리 설치 (Bootstrap 제거됨)
npm install react-router-dom @reduxjs/toolkit react-redux lucide-react --legacy-peer-deps
# Tailwind 초기화 (로컬 v3 버전 사용)
npx tailwindcss init -p
React 19 확인: package.json에서 react 버전이 ^19.0.0인지 확인합니다.3단계: Tailwind CSS 설정Tailwind가 프로젝트 내의 파일을 스캔하여 스타일을 생성하도록 설정합니다.tailwind.config.js 수정:content 배열에 파일 경로를 추가합니다./** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
src/index.css 수정:기존 내용을 모두 지우고 Tailwind 지시어를 추가합니다.@tailwind base;
@tailwind components;
@tailwind utilities;
4단계: Vite 설정 (프록시)client/vite.config.js를 수정하여 개발 서버 포트를 5173으로 고정하고 API 프록시를 설정합니다.import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/auth': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
5단계: Frontend 코드 적용1. client/src/main.jsxBootstrap import를 제거하고 index.css만 유지합니다.import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css' // Tailwind 지시어가 포함된 CSS
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
2. client/src/App.jsx로그인 후 대시보드 화면을 구성하는 전체 코드입니다. Redux를 사용하여 상태를 관리하고 라우팅을 처리합니다. '웹권한관리' 페이지가 추가되었습니다.import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { configureStore, createSlice } from '@reduxjs/toolkit';
// lucide-react가 설치되지 않았다면 2단계의 --legacy-peer-deps 옵션을 확인하세요.
// Shield 아이콘 추가
import { Menu, X, LogOut, FileSpreadsheet, Users, Settings, BarChart3, Lock, Shield } from 'lucide-react';

// Redux Slices
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    isAuthenticated: false, // 기본값을 false로 변경 (로그인 필요)
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

// Page Components
const DBManagementPage = () => {
  const config = useSelector((state) => state.config);
  const user = useSelector((state) => state.auth.user);
  const spreadHostRef = useRef(null);
  const spreadRef = useRef(null);

  useEffect(() => {
    const loadSpreadJS = async () => {
      const cssLink = document.createElement('link');
      cssLink.rel = 'stylesheet';
      // jsDelivr CDN 사용 (버전 16.2.0)
      cssLink.href = '[https://cdn.jsdelivr.net/npm/@grapecity/spread-sheets@16.2.0/styles/gc.spread.sheets.excel2016colorful.css](https://cdn.jsdelivr.net/npm/@grapecity/spread-sheets@16.2.0/styles/gc.spread.sheets.excel2016colorful.css)';
      document.head.appendChild(cssLink);

      const script = document.createElement('script');
      // jsDelivr CDN 사용 (버전 16.2.0)
      script.src = '[https://cdn.jsdelivr.net/npm/@grapecity/spread-sheets@16.2.0/dist/gc.spread.sheets.all.min.js](https://cdn.jsdelivr.net/npm/@grapecity/spread-sheets@16.2.0/dist/gc.spread.sheets.all.min.js)';
      script.async = true;
      
      script.onload = () => {
        if (window.GC && window.GC.Spread && spreadHostRef.current && !spreadRef.current) {
          const spread = new window.GC.Spread.Sheets.Workbook(spreadHostRef.current, {
            sheetCount: 1,
            newTabVisible: true
          });
          
          const sheet = spread.getActiveSheet();
          sheet.setRowCount(config.itemsPerPage || 50);
          sheet.setColumnCount(26);
          
          // 헤더 설정
          const headers = ['DB명', '사용자', '권한', '생성일', '상태', '비고'];
          headers.forEach((header, i) => {
            sheet.setValue(0, i, header);
            const headerStyle = new window.GC.Spread.Sheets.Style();
            headerStyle.backColor = '#4c51bf';
            headerStyle.foreColor = '#ffffff';
            headerStyle.font = 'bold 12px Arial';
            headerStyle.hAlign = window.GC.Spread.Sheets.HorizontalAlign.center;
            sheet.setStyle(0, i, headerStyle);
            sheet.setColumnWidth(i, 150);
          });
          
          // 샘플 데이터
          const sampleData = [
            ['DB_PROD_01', user?.email || 'admin@ez-office.co.kr', 'READ/WRITE', '2024-01-15', '활성', '프로덕션 DB'],
            ['DB_PROD_02', 'user@ez-office.co.kr', 'READ', '2024-02-20', '활성', '읽기 전용'],
            ['DB_TEST_01', 'dev@ez-office.co.kr', 'READ/WRITE', '2024-03-10', '비활성', '테스트 DB']
          ];
          
          sampleData.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
              sheet.setValue(rowIndex + 1, colIndex, cell);
            });
          });
          
          spreadRef.current = spread;
        }
      };
      
      document.body.appendChild(script);
    };

    loadSpreadJS();
  }, [config.itemsPerPage, user]);

  return (
    <div>
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">DB 권한관리</h1>
        <p className="text-gray-600">
          현재 사용자: {user?.name} ({user?.email})
        </p>
        <p className="text-sm text-gray-500 mt-2">
          표시 행 수: {config.itemsPerPage} | 자동저장: {config.autoSave ? '활성' : '비활성'}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div 
          ref={spreadHostRef}
          style={{ 
            width: '100%', 
            height: '600px',
            border: '1px solid #e5e7eb'
          }}
        />
      </div>
    </div>
  );
};

// 새로 추가된 웹권한관리 페이지
const WebAuthPage = () => {
  const user = useSelector((state) => state.auth.user);

  return (
    <div>
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">웹권한관리</h1>
        <p className="text-gray-600">사용자별 웹 메뉴 접근 권한을 관리합니다.</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center py-20">
          <Shield size={64} className="mx-auto mb-4 text-purple-200" />
          <h3 className="text-lg font-medium text-gray-900">웹 권한 설정</h3>
          <p className="mt-1 text-gray-500">이 페이지는 현재 개발 중입니다.</p>
        </div>
      </div>
    </div>
  );
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
    { id: 'web-auth', label: '웹권한관리', icon: Shield, path: '/web-auth' }, // 웹권한관리 메뉴 추가
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
    <div className="min-h-screen bg-gray-50">
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

      <div className="flex pt-16">
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

        {/* 메인 컨텐츠 */}
        <main className={`flex-1 p-6 transition-all duration-300 ${sidebarOpen ? 'ml-80' : 'ml-0'}`}>
          <div className="max-w-7xl mx-auto">
            <Routes>
              <Route path="/" element={<DBManagementPage />} />
              <Route path="/web-auth" element={<WebAuthPage />} /> {/* 웹권한관리 라우트 추가 */}
              <Route path="/service-settings" element={<ServiceSettingsPage />} />
              <Route path="/service-report" element={<ServiceReportPage />} />
              <Route path="/service-admin" element={<ServiceAdminPage />} />
              <Route path="/config" element={<ConfigPage />} />
            </Routes>
          </div>
        </main>
      </div>

      {/* 푸터 */}
      <footer className="bg-gray-900 text-white mt-12">
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
