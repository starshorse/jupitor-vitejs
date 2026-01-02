import React, { useState, useEffect } from 'react';
import { Shield, Check, Copy, AlertCircle, ChevronDown, Building2, User } from 'lucide-react';

const AuthKey = () => {
  const [copied, setCopied] = useState('');
  const [selectedOrg, setSelectedOrg] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [users, setUsers] = useState([]);
  const [authData, setAuthData] = useState(null);

  // 샘플 조직 데이터
  const organizations = [
    { id: 'org1', name: 'Ez Office Corporation' },
    { id: 'org2', name: 'Tech Solutions Ltd' },
    { id: 'org3', name: 'Digital Innovations Inc' },
    { id: 'org4', name: 'Cloud Services Group' }
  ];

  // 조직별 사용자 데이터
  const organizationUsers = {
    org1: [
      { id: 'user1', name: '최성철', email: 'richard.choi@ez-office.co.kr' },
      { id: 'user2', name: '김민수', email: 'minsu.kim@ez-office.co.kr' },
      { id: 'user3', name: '박지영', email: 'jiyoung.park@ez-office.co.kr' }
    ],
    org2: [
      { id: 'user4', name: '이준호', email: 'junho.lee@techsolutions.com' },
      { id: 'user5', name: '정수진', email: 'sujin.jung@techsolutions.com' }
    ],
    org3: [
      { id: 'user6', name: '강민지', email: 'minji.kang@digitalinnovations.com' },
      { id: 'user7', name: '윤서준', email: 'seojun.yoon@digitalinnovations.com' }
    ],
    org4: [
      { id: 'user8', name: '한승우', email: 'seungwoo.han@cloudservices.com' },
      { id: 'user9', name: '오지혜', email: 'jihye.oh@cloudservices.com' }
    ]
  };

  // 사용자별 인증 데이터
  const userAuthData = {
    user1: {
      orgAuthSecret: 'ORG1-SECRET-ABCDEF1234567890',
      machAuthSecret: 'MACH1-SECRET-ZYXWVU0987654321',
      machAuthIdentifier: 'MACH-AUTH-12345',
      lastUpdated: '2024-01-02',
      securityLevel: '높음',
      status: '활성화'
    },
    user2: {
      orgAuthSecret: 'ORG1-SECRET-GHIJKL2345678901',
      machAuthSecret: 'MACH2-SECRET-WVUTSR8765432109',
      machAuthIdentifier: 'MACH-AUTH-67890',
      lastUpdated: '2024-01-01',
      securityLevel: '중간',
      status: '활성화'
    },
    user3: {
      orgAuthSecret: 'ORG1-SECRET-MNOPQR3456789012',
      machAuthSecret: 'MACH3-SECRET-RQPONM7654321098',
      machAuthIdentifier: null,
      lastUpdated: '2023-12-30',
      securityLevel: '낮음',
      status: '비활성화'
    },
    user4: {
      orgAuthSecret: 'ORG2-SECRET-STUVWX4567890123',
      machAuthSecret: 'MACH4-SECRET-XWVUTS6543210987',
      machAuthIdentifier: 'MACH-AUTH-11111',
      lastUpdated: '2024-01-02',
      securityLevel: '높음',
      status: '활성화'
    },
    user5: {
      orgAuthSecret: 'ORG2-SECRET-YZABCD5678901234',
      machAuthSecret: 'MACH5-SECRET-DCBAYZ5432109876',
      machAuthIdentifier: 'MACH-AUTH-22222',
      lastUpdated: '2023-12-28',
      securityLevel: '높음',
      status: '활성화'
    },
    user6: {
      orgAuthSecret: 'ORG3-SECRET-EFGHIJ6789012345',
      machAuthSecret: 'MACH6-SECRET-JIHGFE4321098765',
      machAuthIdentifier: 'MACH-AUTH-33333',
      lastUpdated: '2024-01-01',
      securityLevel: '중간',
      status: '활성화'
    },
    user7: {
      orgAuthSecret: 'ORG3-SECRET-KLMNOP7890123456',
      machAuthSecret: 'MACH7-SECRET-PONMLK3210987654',
      machAuthIdentifier: null,
      lastUpdated: '2023-12-25',
      securityLevel: '낮음',
      status: '비활성화'
    },
    user8: {
      orgAuthSecret: 'ORG4-SECRET-QRSTUV8901234567',
      machAuthSecret: 'MACH8-SECRET-VUTSRQ2109876543',
      machAuthIdentifier: 'MACH-AUTH-44444',
      lastUpdated: '2024-01-02',
      securityLevel: '높음',
      status: '활성화'
    },
    user9: {
      orgAuthSecret: 'ORG4-SECRET-WXYZAB9012345678',
      machAuthSecret: 'MACH9-SECRET-BAZYXW1098765432',
      machAuthIdentifier: 'MACH-AUTH-55555',
      lastUpdated: '2023-12-31',
      securityLevel: '중간',
      status: '활성화'
    }
  };

  // 조직 선택 시 사용자 목록 업데이트
  useEffect(() => {
    if (selectedOrg) {
      setUsers(organizationUsers[selectedOrg] || []);
      setSelectedUser('');
      setAuthData(null);
    } else {
      setUsers([]);
      setSelectedUser('');
      setAuthData(null);
    }
  }, [selectedOrg]);

  // 사용자 선택 시 인증 데이터 로드
  useEffect(() => {
    if (selectedUser) {
      setAuthData(userAuthData[selectedUser] || null);
    } else {
      setAuthData(null);
    }
  }, [selectedUser]);

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(''), 2000);
  };

  const handleFocus = (e) => {
    e.target.select();
  };

  const handleSubmit = () => {
    alert('설정이 저장되었습니다!');
  };

  const getSelectedOrgName = () => {
    const org = organizations.find(o => o.id === selectedOrg);
    return org ? org.name : '조직을 선택하세요';
  };

  const getSelectedUserInfo = () => {
    const user = users.find(u => u.id === selectedUser);
    return user;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg mb-4">
            <Shield className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">인증 설정</h1>
          <p className="text-gray-600">조직 및 기기 인증 정보를 관리합니다</p>
        </div>

        {/* 조직 및 사용자 선택 카드 */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* 조직 선택 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <Building2 size={18} className="mr-2 text-purple-600" />
                조직 선택
              </label>
              <div className="relative">
                <select
                  value={selectedOrg}
                  onChange={(e) => setSelectedOrg(e.target.value)}
                  className="w-full px-4 py-3 pr-10 bg-gray-50 border-2 border-gray-200 rounded-xl
                            focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-100
                            transition-all duration-200 appearance-none cursor-pointer
                           hover:border-purple-300 text-gray-700 font-medium"
                >
                  <option value="">조직을 선택하세요</option>
                  {organizations.map(org => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
                <ChevronDown 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" 
                  size={20} 
                />
              </div>
            </div>

            {/* 사용자 선택 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <User size={18} className="mr-2 text-indigo-600" />
                사용자 선택
              </label>
              <div className="relative">
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  disabled={!selectedOrg}
                  className="w-full px-4 py-3 pr-10 bg-gray-50 border-2 border-gray-200 rounded-xl
                            focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100
                            transition-all duration-200 appearance-none cursor-pointer
                           hover:border-indigo-300 text-gray-700 font-medium
                           disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">사용자를 선택하세요</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
                <ChevronDown 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" 
                  size={20} 
                />
              </div>
            </div>
          </div>

          {/* 선택된 정보 표시 */}
          {selectedOrg && (
            <div className="mt-4 p-4 bg-purple-50 rounded-xl border border-purple-200">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center space-x-2">
                  <Building2 size={16} className="text-purple-600" />
                  <span className="text-sm font-medium text-purple-900">
                    {getSelectedOrgName()}
                  </span>
                </div>
                {selectedUser && getSelectedUserInfo() && (
                  <div className="flex items-center space-x-2">
                    <User size={16} className="text-indigo-600" />
                    <span className="text-sm font-medium text-indigo-900">
                      {getSelectedUserInfo().name}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 인증 정보 카드 */}
        {authData && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* 상태 표시 헤더 */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center space-x-3">
                  {authData.machAuthIdentifier ? (
                    <>
                      <div className="relative">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
                          <Shield className="text-purple-600" size={20} />
                        </div>
                        <span className="absolute -top-1 -right-1 flex h-4 w-4">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 border-2 border-white"></span>
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <Check size={16} className="text-green-300" />
                          <span className="text-white font-semibold">인증 활성화</span>
                        </div>
                        <p className="text-purple-200 text-sm">기기 인증이 설정되었습니다</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                        <AlertCircle className="text-white" size={20} />
                      </div>
                      <div>
                        <span className="text-white font-semibold">인증 비활성화</span>
                        <p className="text-purple-200 text-sm">기기 인증이 설정되지 않았습니다</p>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="text-right">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                    <p className="text-purple-100 text-xs font-medium">조직명</p>
                    <p className="text-white font-bold">{getSelectedOrgName()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 폼 내용 */}
            <div className="p-8 space-y-6">
              {/* 사용자 정보 */}
              <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-indigo-600 font-medium">선택된 사용자</p>
                    <p className="text-lg font-bold text-indigo-900">{getSelectedUserInfo()?.name}</p>
                    <p className="text-sm text-indigo-700">{getSelectedUserInfo()?.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-indigo-600">상태</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      authData.status === '활성화' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {authData.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Organization Auth Secret */}
              <div className="group">
                <label 
                  htmlFor="orgAuthSecret" 
                  className="block text-sm font-semibold text-gray-700 mb-3 flex items-center"
                >
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                  Organization Auth Secret
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="orgAuthSecret"
                    value={authData.orgAuthSecret}
                    onFocus={handleFocus}
                    readOnly
                    className="w-full px-4 py-4 pr-12 bg-gray-50 border-2 border-gray-200 rounded-xl
                              focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-100
                              transition-all duration-200 font-mono text-sm text-gray-700
                             group-hover:border-purple-300"
                    placeholder="Organization Auth Secret"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(authData.orgAuthSecret, 'org')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg
                             hover:bg-purple-100 text-gray-400 hover:text-purple-600 
                              transition-all duration-200"
                    title="복사"
                  >
                    {copied === 'org' ? (
                      <Check size={20} className="text-green-500" />
                    ) : (
                      <Copy size={20} />
                    )}
                  </button>
                </div>
                <p className="mt-2 text-xs text-gray-500 flex items-center">
                  <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></span>
                  조직 인증에 사용되는 비밀 키입니다
                </p>
              </div>

              {/* Machine Auth Secret */}
              <div className="group">
                <label 
                  htmlFor="machAuthSecret" 
                  className="block text-sm font-semibold text-gray-700 mb-3 flex items-center"
                >
                  <div className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></div>
                  Machine Auth Secret
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="machAuthSecret"
                    value={authData.machAuthSecret}
                    onFocus={handleFocus}
                    readOnly
                    className="w-full px-4 py-4 pr-12 bg-gray-50 border-2 border-gray-200 rounded-xl
                              focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100
                              transition-all duration-200 font-mono text-sm text-gray-700
                             group-hover:border-indigo-300"
                    placeholder="Machine Auth Secret"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(authData.machAuthSecret, 'mach')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg
                             hover:bg-indigo-100 text-gray-400 hover:text-indigo-600 
                              transition-all duration-200"
                    title="복사"
                  >
                    {copied === 'mach' ? (
                      <Check size={20} className="text-green-500" />
                    ) : (
                      <Copy size={20} />
                    )}
                  </button>
                </div>
                <p className="mt-2 text-xs text-gray-500 flex items-center">
                  <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></span>
                  기기 인증에 사용되는 비밀 키입니다
                </p>
              </div>

              {/* 액션 버튼 */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200 flex-wrap gap-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <div className={`w-2 h-2 rounded-full ${
                    authData.status === '활성화' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                  }`}></div>
                  <span>인증 정보가 안전하게 저장되었습니다</span>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedOrg('');
                      setSelectedUser('');
                      setAuthData(null);
                    }}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold
                             hover:bg-gray-200 transition-all duration-200 
                              hover:shadow-md active:scale-95"
                  >
                    초기화
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold
                             hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 
                              shadow-lg hover:shadow-xl active:scale-95"
                  >
                    설정 저장
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 선택 안내 메시지 */}
        {!authData && (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <Shield className="text-gray-400" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              조직과 사용자를 선택하세요
            </h3>
            <p className="text-gray-600">
              {!selectedOrg 
                ? '먼저 조직을 선택한 후 사용자를 선택하면 인증 정보가 표시됩니다.' 
                : '사용자를 선택하면 해당 사용자의 인증 정보가 표시됩니다.'}
            </p>
          </div>
        )}

        {/* 통계 카드 */}
        {authData && (
          <div className="mt-6 grid md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  authData.securityLevel === '높음' ? 'bg-green-100' : 
                  authData.securityLevel === '중간' ? 'bg-yellow-100' : 'bg-red-100'
                }`}>
                  <Shield className={`${
                    authData.securityLevel === '높음' ? 'text-green-600' : 
                    authData.securityLevel === '중간' ? 'text-yellow-600' : 'text-red-600'
                  }`} size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">보안 등급</p>
                  <p className="font-semibold text-gray-800">{authData.securityLevel}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  authData.status === '활성화' ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  <Check className={`${
                    authData.status === '활성화' ? 'text-green-600' : 'text-gray-600'
                  }`} size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">인증 상태</p>
                  <p className="font-semibold text-gray-800">{authData.status}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="text-blue-600" size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">마지막 갱신</p>
                  <p className="font-semibold text-gray-800">{authData.lastUpdated}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 안내 카드 */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <AlertCircle className="text-white" size={18} />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-blue-900 font-semibold mb-2">보안 안내</h3>
              <ul className="text-blue-800 text-sm space-y-1.5">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>인증 키는 외부에 노출되지 않도록 주의하세요</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>정기적으로 인증 키를 갱신하는 것을 권장합니다</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>문제가 발생하면 관리자에게 문의하세요</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthKey;

