import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Popconfirm,
  message,
  Space,
  App as AntApp, // Ant Design App komponentini ishlatamiz
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";

// ====================================================================
// 1. TIPLAR (TYPESCRIPT INTERFEYSLAR)
// ====================================================================

// Ma'lumotlar modeli
interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
}

// Yangi yaratish/Tahrirlash uchun ma'lumotlar (ID siz)
type UserPayload = Omit<User, "id">;

// .NET API bazaviy manzili
// Eslatma: .NET API ishlaydigan portni tekshiring va kerak bo'lsa o'zgartiring!
const API_BASE_URL = "http://localhost:5140/api/users";

// ====================================================================
// 2. HAQIQIY API CHAQIRUVLARI (Backend (.NET) ga ulanish)
// ====================================================================

const api = {
  // READ: Barcha foydalanuvchilarni olish
  getUsers: async (): Promise<User[]> => {
    const response = await fetch(API_BASE_URL);
    if (!response.ok) {
      throw new Error("Ma'lumotlarni olishda xato yuz berdi");
    }
    return response.json();
  },

  // CREATE: Yangi foydalanuvchi yaratish
  createUser: async (payload: UserPayload): Promise<User> => {
    const response = await fetch(API_BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error("Yaratishda xato yuz berdi");
    }
    return response.json();
  },

  // UPDATE: Foydalanuvchini tahrirlash
  updateUser: async (id: number, payload: UserPayload): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    // .NET PUT endpointi 204 No Content qaytaradi (response.ok bo'ladi)
    if (!response.ok) {
      throw new Error("Tahrirlashda xato yuz berdi");
    }
  },

  // DELETE: Foydalanuvchini o'chirish
  deleteUser: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: "DELETE",
    });
    // .NET DELETE endpointi 204 No Content qaytaradi
    if (!response.ok) {
      throw new Error("O'chirishda xato yuz berdi");
    }
  },
};

// ====================================================================
// 3. ASOSIY REACT KOMPONENTI
// ====================================================================

const UserCrudContent: React.FC = () => {
  const { message } = AntApp.useApp();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();

  // READ: Ma'lumotlarni yuklash
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await api.getUsers();
      // API dan kelgan Id int bo'lishi kerak, lekin ba'zida string bo'lib kelishi mumkin, shuning uchun tekshiramiz
      const cleanedData = data.map((u) => ({
        ...u,
        id: typeof u.id === "string" ? parseInt(u.id, 10) : u.id,
      }));
      setUsers(cleanedData);
    } catch (error) {
      console.error(error);
      message.error(
        "Foydalanuvchilarni yuklashda xato yuz berdi! Backend ishlayotganiga ishonch hosil qiling."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Modal (ochish/yopish) boshqaruvi
  const handleOpenModal = (user: User | null = null) => {
    setEditingUser(user);
    setIsModalVisible(true);
    if (user) {
      form.setFieldsValue(user); // Tahrirlash uchun ma'lumotlarni yuklash
    } else {
      form.resetFields(); // Yangi yaratish uchun Formani tozalash
    }
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setEditingUser(null);
    form.resetFields();
  };

  // CREATE/UPDATE: Forma Submit bo'lganda
  const handleFormSubmit = async (values: UserPayload) => {
    try {
      if (editingUser) {
        // UPDATE
        await api.updateUser(editingUser.id, values);
        message.success(
          `Foydalanuvchi #${editingUser.id} muvaffaqiyatli yangilandi!`
        );
      } else {
        // CREATE
        const newUser = await api.createUser(values);
        message.success(
          `Yangi foydalanuvchi #${newUser.id} muvaffaqiyatli qo‘shildi!`
        );
      }
      handleCloseModal();
      fetchUsers(); // Ro'yxatni yangilash
    } catch (error) {
      console.error(error);
      message.error("Saqlashda xato yuz berdi! (Konsolni tekshiring)");
    }
  };

  // DELETE: Foydalanuvchini o'chirish
  const handleDelete = async (id: number) => {
    try {
      await api.deleteUser(id);
      message.success(`Foydalanuvchi #${id} o‘chirildi.`);
      fetchUsers(); // Ro'yxatni yangilash
    } catch (error) {
      console.error(error);
      message.error("O‘chirishda xato yuz berdi! (Konsolni tekshiring)");
    }
  };

  // Ant Design Table uchun ustunlar konfiguratsiyasi
  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 80 },
    { title: "Ism", dataIndex: "name", key: "name" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Telefon", dataIndex: "phone", key: "phone" },
    {
      title: "Harakatlar",
      key: "actions",
      width: 150,
      render: (text: string, record: User) => (
        <Space size="middle">
          {/* UPDATE tugmasi */}
          <Button
            icon={<EditOutlined />}
            onClick={() => handleOpenModal(record)}
            type="link"
          />

          {/* DELETE tugmasi */}
          <Popconfirm
            title="Haqiqatan ham o'chirmoqchimisiz?"
            onConfirm={() => handleDelete(record.id)}
            okText="Ha"
            cancelText="Yo'q"
          >
            <Button icon={<DeleteOutlined />} danger type="link" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h1>Foydalanuvchilar Ro'yxati (.NET Backend)</h1>

      {/* CREATE tugmasi */}
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => handleOpenModal(null)}
        style={{ marginBottom: 16 }}
      >
        Yangi qo'shish
      </Button>

      {/* READ: Ma'lumotlar jadvali */}
      <Table<User>
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
        bordered
      />

      {/* CREATE/UPDATE Modal oynasi */}
      <Modal
        title={
          editingUser
            ? "Foydalanuvchini Tahrirlash"
            : "Yangi Foydalanuvchi Yaratish"
        }
        open={isModalVisible}
        onCancel={handleCloseModal}
        footer={[
          <Button key="back" onClick={handleCloseModal}>
            Bekor qilish
          </Button>,
          <Button key="submit" type="primary" onClick={() => form.submit()}>
            Saqlash
          </Button>,
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          name="user_form"
          onFinish={handleFormSubmit}
        >
          <Form.Item
            name="name"
            label="Ism"
            rules={[{ required: true, message: "Iltimos, ism kiriting!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              {
                required: true,
                type: "email",
                message: "Iltimos, haqiqiy email kiriting!",
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Telefon"
            rules={[
              { required: true, message: "Iltimos, telefon raqam kiriting!" },
            ]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

// Ant Design App kontekstini qo'shish (message va modal kabi funksiyalarni ishlatish uchun)
const App: React.FC = () => {
  return (
    <AntApp>
      <UserCrudContent />
    </AntApp>
  );
};

export default App;
