import './App.css'
import { useUpload, FileExtra } from './hooks/useUpload'
import { UploadResult } from './manager/upload-manager';

// 关于视图层的东西 放在这里

// 上传按钮文案
function formatBtnText (result: UploadResult) {
  if(result === UploadResult.SUCCESS) {
    return '完成'
  }else if(result === UploadResult.FAIL) {
    return '重新开始'
  }else {
    return '开始'
  }
}

// 上传标题文案
function formatTitle (files: FileExtra[]) {
  if(files.length === 0) {
    return '请上传'
  }

  if(files.every(file=> file.result === UploadResult.SUCCESS)) return '全部成功'
  if(files.every(file=> file.result === UploadResult.FAIL)) return '全部失败'
  if(files.some(file=> file.result === UploadResult.FAIL)) return '上传异常'

  return '等待上传'
}

// 统一上传按钮文案
function formatUnifyBtnText(files: FileExtra[]) {
  if(files.length === 0) {
    return '全部开始'
  }

  // 全部成功
  if(files.every(file=> file.result === UploadResult.SUCCESS)) return '全部成功'
  // 全部失败
  if(files.every(file=> file.result === UploadResult.FAIL)) return '重新开始'
  // 部分失败
  if(files.some(file=> file.result === UploadResult.FAIL)) return '继续开始'

  return '全部开始'
}

// 上传按钮背景色
function activeUploadBtnColor (result: UploadResult) {
  if(result === UploadResult.PENDING) {
    return {
      backgroundColor: '#6890f7'
    }
  }
  if(result === UploadResult.SUCCESS) {
    return {
      backgroundColor: '#5fce72'
    }
  }
  if(result === UploadResult.FAIL) {
    return {
      backgroundColor: '#f19b4a'
    }
  }
}

function App() {
  const { filesState, addFile, uploadClick, uploadAllClick } = useUpload();
  return (
    <>
      <main className="flex min-h-screen flex-col items-center p-24 rounded-3xl w-100vw">
      <input className='mb-4 w-5/12' type="file" multiple onChange={ addFile }></input>
      <div className="bg-white w-5/12 ">
        <div className='flex justify-between items-center p-4'>
          <div>{ formatTitle(filesState) }</div>
          <button onClick={()=> uploadAllClick()}>{ formatUnifyBtnText(filesState) }</button>
        </div>
        <div className="p-4 border w-full flex-col border-b-slate-400 flex justify-between items-center">
            {filesState.map((file, index) => (
              <div className="p-4 w-full flex justify-between items-center" key={index}>
                <div>{file.name}</div>
                <div>
                  <span className='mr-4'>{ file.progress + '%' }</span>
                  <button className='text-white border-white' style={activeUploadBtnColor(file.result!)} onClick={()=> uploadClick(file)}>{ formatBtnText(file.result!) }</button>
                </div>
              </div>
            ))}
        </div>

        <div>

        </div>
      </div>
      </main>
    </>
  )
}

export default App
