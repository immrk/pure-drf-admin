export const redirects = JSON.parse("{}")

export const routes = Object.fromEntries([
  ["/devdoc.html", { loader: () => import(/* webpackChunkName: "devdoc.html" */"/Users/keyajian/Develop/puredrf/pure-admin-thin/docs/.vuepress/.temp/pages/devdoc.html.js"), meta: {"title":"Hello VuePress"} }],
  ["/", { loader: () => import(/* webpackChunkName: "index.html" */"/Users/keyajian/Develop/puredrf/pure-admin-thin/docs/.vuepress/.temp/pages/index.html.js"), meta: {"title":""} }],
  ["/404.html", { loader: () => import(/* webpackChunkName: "404.html" */"/Users/keyajian/Develop/puredrf/pure-admin-thin/docs/.vuepress/.temp/pages/404.html.js"), meta: {"title":""} }],
]);

if (import.meta.webpackHot) {
  import.meta.webpackHot.accept()
  if (__VUE_HMR_RUNTIME__.updateRoutes) {
    __VUE_HMR_RUNTIME__.updateRoutes(routes)
  }
  if (__VUE_HMR_RUNTIME__.updateRedirects) {
    __VUE_HMR_RUNTIME__.updateRedirects(redirects)
  }
}

if (import.meta.hot) {
  import.meta.hot.accept(({ routes, redirects }) => {
    __VUE_HMR_RUNTIME__.updateRoutes(routes)
    __VUE_HMR_RUNTIME__.updateRedirects(redirects)
  })
}
