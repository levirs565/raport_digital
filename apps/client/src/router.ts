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
import AddPeriode from './pages/operator/periode/AddPeriode.vue';
import PeriodeDetail from './pages/operator/periode/PeriodeDetail.vue';
import MataPelajaranList from './pages/operator/mata-pelajaran/MataPelajaranList.vue';
import AddMataPelajaran from './pages/operator/mata-pelajaran/AddMataPelajaran.vue';
import MataPelajaranDetail from './pages/operator/mata-pelajaran/MataPelajaranDetail.vue';
import EkstrakurikulerList from './pages/operator/ekstrakurikuler/EkstrakurikulerList.vue';
import AddEkstrakurikuler from './pages/operator/ekstrakurikuler/AddEkstrakurikuler.vue';
import EkstrakurikulerDetail from './pages/operator/ekstrakurikuler/EkstrakurikulerDetail.vue';
import KelasList from './pages/operator/kelas/KelasList.vue';
import AddKelas from './pages/operator/kelas/AddKelas.vue';
import KelasDetail from './pages/operator/kelas/KelasDetail.vue';
import AddMataPelajaranKelas from './pages/operator/kelas/AddMataPelajaranKelas.vue';
import EditAnggotaKelas from './pages/operator/kelas/EditAnggotaKelas.vue';
import GuruEkstrakurikulerDetail from './pages/guru/ekstrakurikuler/GuruEkstrakurikulerDetail.vue';
import UpdateAnggotaEkstrakurikuler from './pages/guru/ekstrakurikuler/UpdateAnggotaEkstrakurikuler.vue';
import UpdateNilaiEkstrakurikuler from './pages/guru/ekstrakurikuler/UpdateNilaiEkstrakurikuler.vue';
import GuruMataPelajaranDetail from './pages/guru/mata-pelajaran/GuruMataPelajaranDetail.vue';
import GuruMateriDetail from './pages/guru/mata-pelajaran/GuruMateriDetail.vue';
import GuruAddMateri from './pages/guru/mata-pelajaran/GuruAddMateri.vue';
import GuruUpdateNilaiMateri from './pages/guru/mata-pelajaran/GuruUpdateNilaiMateri.vue';

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
                path: 'add',
                component: AddPeriode,
              },
              {
                path: ':id',
                children: [
                  {
                    path: '',
                    component: PeriodeDetail,
                    props: true,
                  },
                  {
                    path: 'edit',
                    component: AddPeriode,
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
                path: 'add',
                component: AddMataPelajaran,
              },
              {
                path: ':id',
                children: [
                  {
                    path: '',
                    component: MataPelajaranDetail,
                    props: true,
                  },
                  {
                    path: 'edit',
                    component: AddMataPelajaran,
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
                path: 'add',
                component: AddEkstrakurikuler,
              },
              {
                path: ':id',
                children: [
                  {
                    path: '',
                    component: EkstrakurikulerDetail,
                    props: true,
                  },
                  {
                    path: 'edit',
                    component: AddEkstrakurikuler,
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
                path: 'add',
                component: AddKelas,
              },
              {
                path: ':id',
                children: [
                  {
                    path: '',
                    component: KelasDetail,
                    props: true,
                  },
                  {
                    path: 'edit',
                    component: AddKelas,
                    props: true,
                  },
                  {
                    path: 'mata-pelajaran',
                    children: [
                      {
                        path: 'add',
                        component: AddMataPelajaranKelas,
                        props: true,
                      },
                    ],
                  },
                  {
                    path: 'anggota',
                    component: EditAnggotaKelas,
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
                  {
                    path: 'anggota',
                    component: UpdateAnggotaEkstrakurikuler,
                    props: true,
                  },
                  {
                    path: 'nilai',
                    component: UpdateNilaiEkstrakurikuler,
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
                    path: 'add',
                    component: GuruAddMateri,
                    props: true,
                  },
                  {
                    path: ':idMateri',
                    children: [
                      {
                        path: '',
                        component: GuruMateriDetail,
                        props: true,
                      },
                      {
                        path: 'edit',
                        component: GuruAddMateri,
                        props: true,
                      },
                      {
                        path: 'nilai',
                        component: GuruUpdateNilaiMateri,
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
