import { useState, useMemo } from "react";
import { useLocation, Link, Outlet } from "react-router-dom";
import {
  Layout,
  Menu,
  Breadcrumb,
  theme,
  Avatar,
  Typography,
  Flex,
  Button,
} from "antd";
import {
  DashboardOutlined,
  BarChartOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
} from "@ant-design/icons";
import logo from "./assets/logo.png";

const { Header, Sider, Content, Footer } = Layout;
const { Title, Text } = Typography;

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // seleciona item do Menu conforme a rota atual
  const selectedKey = useMemo(() => {
    if (location.pathname.startsWith("/analytics")) return "analytics";
    if (location.pathname.startsWith("/settings")) return "settings";
    return "dashboard";
  }, [location.pathname]);

  // itens do menu com Links
  const menuItems = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: <Link to="/">Dashboard</Link>,
    },
    {
      key: "analytics",
      icon: <BarChartOutlined />,
      label: <Link to="/analytics">Analytics</Link>,
      disabled: true,
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: <Link to="/settings">Settings</Link>,
      disabled: true,
    },
  ];

  // breadcrumb básico
  const crumbs = useMemo(() => {
    const map = {
      "/": "Dashboard",
      "/analytics": "Analytics",
      "/settings": "Settings",
    };
    const title = map[location.pathname] ?? "Dashboard";
    return [{ title: "Home" }, { title }];
  }, [location.pathname]);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        breakpoint="lg"
      >
        <div
          style={{
            height: 80,
            margin: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src={logo}
            alt="Debatim"
            style={{
              height: collapsed ? 32 : 56,
              borderRadius: 12,
              objectFit: "cover",
            }}
          />
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            padding: "0 16px",
            background: colorBgContainer,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Flex gap={8} align="center">
            <Button
              type="text"
              onClick={() => setCollapsed(!collapsed)}
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            />
            <Title level={4} style={{ margin: 0 }}>
              Debatim App
            </Title>
          </Flex>

          <Flex gap={12} align="center">
            <Text type="secondary">azsidaniel</Text>
            <Avatar icon={<UserOutlined />} />
          </Flex>
        </Header>

        <Breadcrumb style={{ margin: "16px 16px 0" }} items={crumbs} />

        <Content style={{ margin: "16px" }}>
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Outlet />
          </div>
        </Content>

        <Footer style={{ textAlign: "center" }}>
          Debatim ©{new Date().getFullYear()}
        </Footer>
      </Layout>
    </Layout>
  );
}
