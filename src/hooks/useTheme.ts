import { bitable } from '@lark-base-open/js-sdk'
import { ref, onMounted } from 'vue'

export const useTheme = () => {
  const theme = ref('')

  const setThemeColor = () => {
    const el = document.documentElement

    // 处理主要样式
    const themeStyles = {
      LIGHT: {
        '--el-color-primary': 'rgb(20, 86, 240)',
        '--el-bg-color': '#fff',
        '--el-border-color-lighter': '#dee0e3'
      },
      DARK: {
        'color-scheme': 'dark',
        '--el-color-primary': '#4571e1',
        '--el-bg-color': '#252525',
        '--el-border-color-lighter': '#434343'
      }
    }

    const currentThemeStyles = themeStyles[theme.value]
    if (theme.value === 'DARK') {
      // html 加上class
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    // 设置样式变量
    Object.entries(currentThemeStyles).forEach(([property, value]) => {
      el.style.setProperty(property, value)
    })
  }

  // 挂载时处理
  onMounted(async() => {
    theme.value = await bitable.bridge.getTheme()
    setThemeColor()
  })

  // 主题修改时处理
  bitable.bridge.onThemeChange((event) => {
    theme.value = event.data.theme
    setThemeColor()
  })

  // 抛出当前主题变量
  return {
    theme
  }
}
