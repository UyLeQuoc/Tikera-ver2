import { LockOutlined, LoginOutlined, MailOutlined } from '@ant-design/icons';
import { Button, Checkbox, Col, Form, Input, notification, Radio, Row, Select, Typography } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { connect } from 'react-redux';
import { Dispatch, dispatch, RootState, state } from '../store';

import { phonePrefixs } from '../constants/phonePrefixs';
import { useState } from 'react';
import { useSignInWithEmailAndPassword } from 'react-firebase-hooks/auth';
import { auth } from '../config/firebase';
import { useRouter } from 'next/router';
import Link from 'next/link';

interface LoginFormProps {
  token: typeof state.authStore.token,
  loginAuth: typeof dispatch.authStore.loginAuth,
}

export const RegisterForm: React.FC<LoginFormProps> = ({
  token,
  loginAuth
}) => {
    const [formController] = useForm();
    const [isEmailLoginType, setIsEmailLoginType] = useState(true)

    const router = useRouter();

    const prefixSelector = (
      <Form.Item name="prefix" noStyle>
        <Select>
          {
            phonePrefixs.map(({code, name},index) => (
              <Select.Option key={index} value={code}>{`${code} ${name}`}</Select.Option>
            ))
          }
        </Select>
      </Form.Item>
    );
    
    const [
      signInWithEmailAndPassword,
      user,
      loading,
      error,
    ] = useSignInWithEmailAndPassword(auth);

    if (user) {
      router.push('/');
    }

    if(error) {
      notification.error({
        message: 'Error',
        description: error.message
      })
    };
    const _onSubmit = async () => {
      formController.submit();

      // Get data from form
      const formResult = formController.getFieldsValue();

      const {typeLogin, prefix, phone, email, password, remember} = formResult;
      console.log(formResult)

      const user = typeLogin === "email" ? (
        {
          username: email,
          password: password
        }
      ) : (
        {
          username: prefix+phone,
          password: password
        }
      );
      signInWithEmailAndPassword(user.username, user.password);

    };

    return (
          <Row justify="center" align="middle">
            <Col sm={18} xs={22}>
              <Typography.Title style={{fontSize: '30px'}} className='m-none'>Xin ch??o b???n ???? ?????n v???i Tikera!</Typography.Title>
              <h3>C??ng tham gia v??o c???ng ?????ng thi???t k??? v?? ng?????i d??ng</h3>
              <Form
                className='mt-x-large'
                  form={formController}
                  layout="vertical"
                  autoComplete="off"
                  initialValues={{
                    typeLogin: 'email',
                    prefix: '+84',
                    remember: false
                  }}
                  size="large"
              >
                <Form.Item name="typeLogin">
                  <Radio.Group>
                    <Radio.Button value="email" onClick={() => setIsEmailLoginType(true)}>Email</Radio.Button>
                    <Radio.Button value="phoneNumber" onClick={() => setIsEmailLoginType(false)}>S??? ??i???n Tho???i</Radio.Button>
                  </Radio.Group>
                </Form.Item>
                  {isEmailLoginType ?(
                  <Form.Item
                    name="email"
                    rules={[{ 
                      required: true, 
                      type: "email", 
                      message: 'H??y ??i???n email c???a b???n!' }]}
                      hasFeedback
                  >
                    <Input prefix={<MailOutlined />} placeholder="Email" />
                  </Form.Item>
                  
                ) : (
                  <Form.Item
                    name="phone"
                    rules={[{ required: true, message: 'H??y ??i???n s??? ??i???n tho???i c???a b???n!', pattern: new RegExp(/^[1-9]{9}|[0-9]{10}$/)}]}
                    hasFeedback
                  >
                    <Input addonBefore={prefixSelector} placeholder="S??? ??i???n tho???i"/>
                  </Form.Item>
                )

                }
                  <Form.Item
                    name="password"
                    rules={[{ required: true, message: 'H??y ??i???n m???t kh???u c???a b???n!' }]}
                    hasFeedback
                  >
                    <Input.Password
                      prefix={<LockOutlined />}
                      type="password"
                      placeholder="M???t kh???u"
                    />
                  </Form.Item>
                  <Link href="/authenticate/register">????ng k?? t??i kho???n</Link>
                  <Form.Item>
                    <Button 
                      className='login-form-button'
                      type="primary" 
                      onClick={_onSubmit}
                      size="large"
                      icon={<LoginOutlined />}
                    >
                      ????ng nh???p
                    </Button>
                  </Form.Item>
              </Form>
            </Col>
          </Row>
    );
};

const mapState = (state: RootState) => ({
  token: state.authStore.token,
});

const mapDispatch = (dispatch: Dispatch) => ({
  loginAuth: dispatch.authStore.loginAuth
});

export default connect(mapState, mapDispatch)(RegisterForm);