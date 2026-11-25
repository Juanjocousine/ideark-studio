import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { StudioProvider } from './studio/Studio'
import { AssetsPage } from './ui/pages/AssetsPage'
import { DashboardPage } from './ui/pages/DashboardPage'
import { EditorPage } from './ui/pages/EditorPage'
import { GalleryPage, TemplatePage } from './ui/pages/GalleryPage'
import { IntegrationsPage, NotFoundPage } from './ui/pages/IntegrationsPage'
import { NewProjectPage } from './ui/pages/NewProjectPage'
import { ProductivityPage } from './ui/pages/ProductivityPage'
import { ProjectPage } from './ui/pages/ProjectPage'
import { ProjectsPage } from './ui/pages/ProjectsPage'
import { QualityPage, QualityReportPage } from './ui/pages/QualityPage'
import { Shell } from './ui/Shell'

export function App() {
  return (
    <StudioProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Shell />}>
            <Route index element={<DashboardPage />} />
            <Route path="proyectos" element={<ProjectsPage />} />
            <Route path="proyectos/nuevo" element={<NewProjectPage />} />
            <Route path="proyectos/:id" element={<ProjectPage />} />
            <Route path="proyectos/:id/editor" element={<EditorPage />} />
            <Route path="galeria" element={<GalleryPage />} />
            <Route path="galeria/:templateId" element={<TemplatePage />} />
            <Route path="activos" element={<AssetsPage />} />
            <Route path="calidad" element={<QualityPage />} />
            <Route path="calidad/:id" element={<QualityReportPage />} />
            <Route path="productividad" element={<ProductivityPage />} />
            <Route path="integraciones" element={<IntegrationsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </StudioProvider>
  )
}
