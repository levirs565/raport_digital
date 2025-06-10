import {
  createRouter,
  createWebHistory,
  RouteLocation,
  type RouteRecordRaw,
} from 'vue-router';
import { UserRole } from '@raport-digital/client-api-types';
import Login from './pages/auth/Login.vue';
import MainLayout from './pages/MainLayout.vue';
import { injectQueryClient, injectTrpc } from './api-vue';
import Dashboard from './pages/dashboard/Dashboard.vue';
import RegisterGuru from './pages/auth/RegisterGuru.vue';
import WaitVerification from './pages/auth/WaitVerification.vue';
import AkunGuru from './pages/operator/AkunGuru.vue';
import SiswaList from './pages/operator/siswa/SiswaList.vue';
import AddSiswa from './pages/operator/siswa/AddSiswa.vue';
import PeriodeList from './pages/operator/periode/PeriodeList.vue';
import PeriodeDetail from './pages/operator/periode/PeriodeDetail.vue';
import MataPelajaranList from './pages/operator/mata-pelajaran/MataPelajaranList.vue';
import MataPelajaranDetail from './pages/operator/mata-pelajaran/MataPelajaranDetail.vue';
import EkstrakurikulerList from './pages/operator/ekstrakurikuler/EkstrakurikulerList.vue';
import EkstrakurikulerDetail from './pages/operator/ekstrakurikuler/EkstrakurikulerDetail.vue';
import KelasList from './pages/operator/kelas/KelasList.vue';
import KelasDetail from './pages/operator/kelas/KelasDetail.vue';
import GuruEkstrakurikulerDetail from './pages/guru/ekstrakurikuler/GuruEkstrakurikulerDetail.vue';
import GuruMataPelajaranDetail from './pages/guru/mata-pelajaran/GuruMataPelajaranDetail.vue';
import GuruMateriDetail from './pages/guru/mata-pelajaran/GuruMateriDetail.vue';
import GuruP5Detail from './pages/guru/p5/GuruP5Detail.vue';
import GuruP5ProyekDetail from './pages/guru/p5/GuruP5ProyekDetail.vue';
import GuruP5TargetDetail from './pages/guru/p5/GuruP5TargetDetail.vue';
import GuruKelasDetail from './pages/guru/wali-kelas/GuruKelasDetail.vue';
import GuruSiswaDetail from './pages/guru/wali-kelas/GuruSiswaDetail.vue';
import KepalaSekolahKelasDetail from './pages/kepala-sekolah/KepalaSekolahKelasDetail.vue';
import KepalaSekolahSiswa from './pages/kepala-sekolah/KepalaSekolahSiswa.vue';
import Akun from './pages/auth/Akun.vue';
import SiswaDetail from './pages/operator/siswa/SiswaDetail.vue';

declare module 'vue-router' {
  interface RouteMeta {
    userRole: UserRole;
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    component: Login,
    meta: {
      userRole: 'NOT-LOGGED',
    },
  },
  {
    path: '/register-guru',
    component: RegisterGuru,
    meta: {
      userRole: 'NOT-LOGGED',
    },
  },
  {
    path: '/wait-verification',
    component: WaitVerification,
    meta: {
      userRole: 'NOT-LOGGED',
    },
  },
  {
    path: '/',
    component: MainLayout,
    meta: {
      userRole: 'LOGGED',
    },
    children: [
      {
        path: '/',
        component: Dashboard,
      },
      {
        path: '/akun',
        component: Akun,
      },
      {
        path: '/operator',
        children: [
          {
            path: 'akun-guru',
            component: AkunGuru,
          },
          {
            path: 'siswa',
            children: [
              {
                path: '',
                component: SiswaList,
              },
              {
                path: 'add',
                component: AddSiswa,
              },
              {
                path: ':id',
                component: SiswaDetail,
                props: true
              },
            ],
          },
          {
            path: 'periode',
            children: [
              {
                path: '',
                component: PeriodeList,
              },
              {
                path: ':id',
                children: [
                  {
                    path: '',
                    component: PeriodeDetail,
                    props: true,
                  },
                ],
              },
            ],
          },
          {
            path: 'mata-pelajaran',
            children: [
              {
                path: '',
                component: MataPelajaranList,
              },
              {
                path: ':id',
                children: [
                  {
                    path: '',
                    component: MataPelajaranDetail,
                    props: true,
                  },
                ],
              },
            ],
          },
          {
            path: 'ekstrakurikuler',
            children: [
              {
                path: '',
                component: EkstrakurikulerList,
              },
              {
                path: ':id',
                children: [
                  {
                    path: '',
                    component: EkstrakurikulerDetail,
                    props: true,
                  },
                ],
              },
            ],
          },
          {
            path: 'kelas',
            children: [
              {
                path: '',
                component: KelasList,
              },
              {
                path: ':id',
                children: [
                  {
                    path: '',
                    component: KelasDetail,
                    props: true,
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        path: 'guru',
        children: [
          {
            path: 'ekstrakurikuler',
            children: [
              {
                path: ':id',
                children: [
                  {
                    path: '',
                    component: GuruEkstrakurikulerDetail,
                    props: true,
                  },
                ],
              },
            ],
          },
          {
            path: 'mata-pelajaran/:idKelas/:idMataPelajaran',
            children: [
              {
                path: '',
                component: GuruMataPelajaranDetail,
                props: true,
              },
              {
                path: 'materi',
                children: [
                  {
                    path: ':idMateri',
                    children: [
                      {
                        path: '',
                        component: GuruMateriDetail,
                        props: true,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            path: 'p5/:idKelas',
            children: [
              {
                path: '',
                component: GuruP5Detail,
                props: true,
              },
              {
                path: 'proyek',
                children: [
                  {
                    path: ':idProyek',
                    children: [
                      {
                        path: '',
                        component: GuruP5ProyekDetail,
                        props: true,
                      },
                      {
                        path: 'target',
                        children: [
                          {
                            path: ':idTarget',
                            children: [
                              {
                                path: '',
                                component: GuruP5TargetDetail,
                                props: true,
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            path: 'wali-kelas/:idKelas',
            children: [
              {
                path: '',
                component: GuruKelasDetail,
                props: true,
              },
              {
                path: ':idSiswa',
                children: [
                  {
                    path: '',
                    component: GuruSiswaDetail,
                    props: true,
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        path: 'kepala-sekolah/kelas/:idKelas',
        children: [
          {
            path: '',
            component: KepalaSekolahKelasDetail,
            props: true,
          },
          {
            path: ':idSiswa',
            component: KepalaSekolahSiswa,
            props: true,
          },
        ],
      },
    ],
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes: routes,
});

export function validateUserRole(
  route: RouteLocation,
  role: UserRole | undefined
) {
  if (route.meta.userRole == null) return true;

  if (route.meta.userRole == 'NOT-LOGGED') {
    if (role)
      return {
        path: '/',
      };
    return true;
  }
  if (!role) {
    return {
      path: '/login',
    };
  }

  if (route.meta.userRole != 'LOGGED' && route.meta.userRole != role) {
    return {
      path: '/',
    };
  }

  return true;
}

router.beforeEach(async (route) => {
  if (route.meta.userRole == null) return true;

  const queryClient = injectQueryClient();
  const trpc = injectTrpc();

  let currentRole: UserRole | undefined = undefined;
  while (true) {
    try {
      const data = await queryClient!.fetchQuery(
        trpc!.auth.state.queryOptions()
      );
      currentRole = data?.type;
      break;
    } catch (error) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  return validateUserRole(route, currentRole);
});
