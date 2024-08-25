import { useEffect, useState } from 'react'
import {FileContext} from './contexts/FileContext'
import './index.css'
import FrontPage from './pages/FrontPage'
import ResultPage from './pages/ResultPage'
import LoadingPage from './pages/LoadingPage'
import { useRequest } from './hooks/useRequest'
function App() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(null)
  useEffect(() => {
    if (!file) {
      return
    }
    const newBody = new FormData()
      newBody.append("file", file as File)
      setLoading(true);
      fetch('http://localhost:8000/tasks', {method: 'POST', body: newBody}).then((res) => {
        if (res.ok) {
          setLoading(false)
          res.json().then((data) => {
            setData(data)
          })
        }}).catch((err) => {
          console.log(err)
        }).finally(() => {
          setLoading(false)})
  }, [file?.name])

  if (loading) {
    return <LoadingPage />
  }
  if (data) {
    return <FileContext.Provider value={{file, setFile, taskId: data["task_id"]}}>
      <ResultPage />
    </FileContext.Provider>
  }

  return (
    <FileContext.Provider value={{file, setFile}}>
      <FrontPage />
    </FileContext.Provider>
    
  )
}

export default App
