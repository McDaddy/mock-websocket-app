import React from 'react';
import { useSetState, useEffectOnce } from 'react-use';
import { Input, Button, PageHeader, notification } from 'antd';
import axios from 'axios';
import { connect } from './ws';
import 'antd/dist/antd.css'
import './App.css';

const defaultMessage = {
  scope: {
    type: "CDP", // 区分数据湖和CDP
    clusterId: 1, // 集群Id
  },
  type: "AD_HOC_QUERY_DONE", // 表示事件类型， 将来可以用来扩展其他所有需要ws的类型
  payload: {
    errors: null, // 如果有错误在这里返回
    queryId: 1000,
    dataSourceName: "abc",
    dataSourceId: 123,
    userId: 2,
  },
}

const selfSocket = connect('http://127.0.0.1:9998/mock/ws');

function App() {

  const [state, setState] = useSetState({
    wsUrl: '',
    content: '',
    wsConnected: false,
    wsClientConnected: false,
  }); 

  useEffectOnce(() => {
    selfSocket.onmessage = (e: any) => {
      const data = JSON.parse(e.data);
      console.log('receive message:', data);
      setState({ wsClientConnected: true });
      notification.success({ message: '客户端已连接'});
    }
  })

  const { wsUrl, content, wsConnected, wsClientConnected } = state;

  const onChangeWsUrl = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState({ wsUrl: e.target.value });
  }

  const onConnect = () => {
    setState({ wsClientConnected: false })
    axios.post('http://127.0.0.1:8000/connect', {
      wsUrl,
    }).then((response) => {
      if (response.data.success) {
        notification.success({ message: '连接成功'});
      } else {
        notification.error({ message: '连接失败'});
      }
    })
  }

  const onSendMessage = () => {
    axios.post('http://127.0.0.1:8000/mockMessage', {
      content,
    });
  }

  return (
    <div className="App">
      <PageHeader title="Mock Websocket" />
      <div className="content">
        <span className="field-title">模拟连接地址</span>
        <div className="field">
          <Input size="large" placeholder="/api/fdp/ws" value={wsUrl} onChange={onChangeWsUrl} />
          <Button className="btn" type="primary" onClick={onConnect}>连接</Button>
        </div>
        <span className="field-title">消息体</span>
        <div className="field">
          <Input.TextArea 
            autoSize={{ minRows: 10, maxRows: 50 }} 
            value={content} 
            onChange={(e) => setState({ content: e.target.value })} 
            placeholder={JSON.stringify(defaultMessage, null, 4)}
          />
          <Button disabled={!wsClientConnected} className="btn" type="primary" onClick={onSendMessage}>发送</Button>
        </div>
      </div>
    </div>
  );
}

export default App;
