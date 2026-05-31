import { test } from '@playwright/test'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const UI_DESIGN_DIR = path.resolve(process.cwd(), '..', '..', 'ui-design')

const DESIGN_SCREENS = [
  ['01-login', 'ng_nh_p_svtn_digital_home'],
  ['02-landing', 'svtn_digital_home_landing_page_synced'],
  ['03-volunteer-form', 'c_ng_ng_k_t_nh_nguy_n_vi_n_svtn'],
  ['04-news-list', 'tin_t_c_s_ki_n_svtn_synced'],
  ['05-news-detail', 'chi_ti_t_b_i_vi_t_svtn_synced'],
  ['06-shop-catalog', 'shop_g_y_qu_danh_m_c_s_n_ph_m'],
  ['07-shop-detail', 'chi_ti_t_s_n_ph_m_o_polo_svtn_2026'],
  ['08-cart-drawer', 'gi_h_ng_cart_panel_shop_svtn'],
  ['09-checkout', 'thanh_to_n_shop_svtn'],
  ['10-fundraising', 'ti_n_g_y_qu_svtn'],
  ['11-member-activity-detail', 'chi_ti_t_ho_t_ng_member_zone'],
  ['12-member-profile', 'h_s_c_nh_n_member_zone'],
  ['13-member-streak', 'chu_i_b_ng_x_p_h_ng_svtn'],
  ['14-member-recap', 'recap_k_ni_m_svtn_member_zone'],
  ['15-member-notifications', 'th_ng_b_o_svtn_portal'],
  ['16-admin-dashboard', 't_ng_quan_admin_zone'],
  ['17-admin-accounts', 'qu_n_l_t_i_kho_n_invite_admin_zone'],
  ['18-volunteer-applications', 'qu_n_l_tnv_danh_s_ch_form_ng_k'],
  ['19-volunteer-application-detail', 'chi_ti_t_form_ng_k_tnv_admin_zone'],
  ['20-admin-activities', 'qu_n_l_ho_t_ng_danh_s_ch'],
  ['21-admin-activity-detail', 't_o_s_a_ho_t_ng_admin_zone'],
  ['22-admin-matcher', 'task_matcher_ph_n_c_ng_tnv'],
  ['23-admin-articles', 'qu_n_l_tin_t_c_cms_admin_zone'],
  ['24-admin-article-editor', 'cms_editor_t_o_s_a_b_i_vi_t'],
  ['25-admin-products', 'qu_n_l_shop_s_n_ph_m'],
  ['26-admin-orders', 'qu_n_l_n_h_ng'],
  ['27-admin-fundraising', 'l_ch_s_giao_d_ch_g_y_qu_svtn_admin'],
  ['28-admin-reports', 'qu_n_l_b_o_c_o_th_ng_k'],
] as const

for (const [name, folder] of DESIGN_SCREENS) {
  test(`design ${name}`, async ({ page }, testInfo) => {
    const htmlPath = path.join(UI_DESIGN_DIR, folder, 'code.html')
    await page.goto(pathToFileURL(htmlPath).href)
    await page.waitForLoadState('networkidle').catch(() => {})
    await page.screenshot({
      path: `design-screenshots/${testInfo.project.name}/${name}.png`,
      fullPage: true,
      animations: 'disabled',
    })
  })
}
