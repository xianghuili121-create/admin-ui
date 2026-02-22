import { usePermissionStore } from '@/stores/permission';

const flattenPermCodes = (menus) => {
  const set = new Set();
  const walk = (nodes) => {
    (nodes || []).forEach((n) => {
      if (n?.permCode) set.add(String(n.permCode));
      if (Array.isArray(n?.children) && n.children.length) walk(n.children);
    });
  };
  walk(menus);
  return set;
};

const normalizeRequired = (v) => {
  if (Array.isArray(v)) return v.map((s) => String(s)).filter(Boolean);
  if (typeof v === 'string') return [v].filter(Boolean);
  return [];
};

const applyPermission = (el, binding) => {
  const permissionStore = usePermissionStore();
  const required = normalizeRequired(binding.value);
  if (required.length === 0) return;

  const permSet = flattenPermCodes(permissionStore.userMenu);
  const ok = required.some((code) => permSet.has(code));

  if (el.__vPermissionDisplay === undefined) el.__vPermissionDisplay = el.style.display || '';
  el.style.display = ok ? el.__vPermissionDisplay : 'none';
};

export function registerPermissionDirective(app) {
  app.directive('permission', {
    mounted(el, binding) {
      applyPermission(el, binding);
    },
    updated(el, binding) {
      applyPermission(el, binding);
    },
  });
}

