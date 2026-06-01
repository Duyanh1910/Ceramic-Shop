import React, {useCallback, useEffect, useState} from "react";
import {Button, DatePicker, Input, message, Rate, Select, Table, Tooltip,} from "antd";
import {DownloadOutlined, SearchOutlined} from "@ant-design/icons";
import dayjs from "dayjs";
import axios from "axios";
import { exportExcelReport } from "../Utility/excelExport";
import styles from "./AdminTable.module.css";

import { API_ADMIN_BASE } from "../config/api";

const {RangePicker} = DatePicker;
const {Option} = Select;
const API_BASE = `${API_ADMIN_BASE}/reviews`;

const ellipsisStyle = {
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "-webkit-box",
    WebkitBoxOrient: "vertical",
    whiteSpace: "normal",
};

const AdminReviews = () => {
    const [data, setData] = useState([]);
    const [loadingTable, setLoadingTable] = useState(false);
    const [loadingExport, setLoadingExport] = useState(false);

    const [searchText, setSearchText] = useState("");
    const [filterRating, setFilterRating] = useState(null);
    const [filterStatus, setFilterStatus] = useState(null);
    const [dateRange, setDateRange] = useState(null);

    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    const fetchData = useCallback(
        async (page = 1, limit = 10, search = "", rating, status, dates) => {
            try {
                setLoadingTable(true);

                let startDate = "";
                let endDate = "";

                if (dates && dates.length === 2) {
                    startDate = dates[0].format("YYYY-MM-DD");
                    endDate = dates[1].format("YYYY-MM-DD");
                }

                const params = {
                    page,
                    limit,
                    search,
                    ...(rating !== null && rating !== undefined && {rating}),
                    ...(status !== null && status !== undefined && {status}),
                    ...(startDate && {startDate}),
                    ...(endDate && {endDate}),
                };

                const queryParams = new URLSearchParams(params);

                const response = await axios.get(
                    `${API_BASE}?${queryParams.toString()}`,
                    {withCredentials: true},
                );

                if (response.data.success) {
                    setData(response.data.result.data || []);
                    setPagination({
                        current: response.data.result.pagination.page,
                        pageSize: response.data.result.pagination.limit,
                        total: response.data.result.pagination.total,
                    });
                }
            } catch (error) {
                console.error("Lỗi khi tải danh sách đánh giá:", error);
                message.error("Lỗi khi tải dữ liệu đánh giá!");
            } finally {
                setLoadingTable(false);
            }
        },
        [],
    );

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchData(
                pagination.current,
                pagination.pageSize,
                searchText,
                filterRating,
                filterStatus,
                dateRange,
            );
        }, 500);

        return () => clearTimeout(timer);
    }, [
        fetchData,
        pagination.current,
        pagination.pageSize,
        searchText,
        filterRating,
        filterStatus,
        dateRange,
    ]);

    const handleTableChange = (newPagination) => {
        setPagination((prev) => ({
            ...prev,
            current: newPagination.current,
            pageSize: newPagination.pageSize,
        }));
    };

    const resetPagination = () => {
        setPagination((prev) => ({...prev, current: 1}));
    };

    const handleExportReport = async () => {
        try {
            setLoadingExport(true);

            await exportExcelReport({
                url: `${API_BASE}/export`,
                params: {
                    search: searchText,
                    ...(filterRating !== null &&
                        filterRating !== undefined && {rating: filterRating}),
                    ...(filterStatus !== null &&
                        filterStatus !== undefined && {status: filterStatus}),
                    startDate: dateRange?.[0]?.format("YYYY-MM-DD"),
                    endDate: dateRange?.[1]?.format("YYYY-MM-DD"),
                },
                axiosConfig: {withCredentials: true},
                fileName: `Bao_Cao_Danh_Gia_${dayjs().format("DDMMYYYY_HHmm")}.xlsx`,
            });

            message.success("Xuất báo cáo thành công!");
        } catch (error) {
            console.error("Lỗi khi xuất báo cáo:", error);
            message.error("Có lỗi xảy ra khi tải file!");
        } finally {
            setLoadingExport(false);
        }
    };

    const getOrderDetail = (record) => {
        return record.ChiTietDonHang || {};
    };

    const getVariant = (record) => {
        const orderDetail = getOrderDetail(record);
        return orderDetail.BienTheSanPham || {};
    };

    const getProduct = (record) => {
        const variant = getVariant(record);
        return variant.SanPham || {};
    };

    const getOrder = (record) => {
        const orderDetail = getOrderDetail(record);
        return orderDetail.DonHang || {};
    };

    const columns = [
        {
            title: "Khách hàng",
            key: "KhachHang",
            width: "16%",
            render: (_, record) => {
                const customer = record.KhachHang || {};
                const customerName = customer.TenKhachHang || "Khách ẩn danh";

                return (
                    <Tooltip title={customerName}>
                        <div
                            style={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                maxWidth: 170,
                                fontWeight: 500,
                            }}
                        >
                            {customerName}
                        </div>
                    </Tooltip>
                );
            },
        },
        {
            title: "Sản phẩm",
            key: "SanPham",
            width: "28%",
            render: (_, record) => {
                const variant = getVariant(record);
                const product = getProduct(record);

                const productText = product.TenSanPham || "N/A";
                const variantText = variant.TenBienThe || "N/A";

                return (
                    <Tooltip title={`${productText} - ${variantText}`}>
                        <div>
                            <div
                                style={{
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                    fontWeight: 600,
                                    color: "#173B63",
                                    maxWidth: 280,
                                }}
                            >
                                {productText}
                            </div>

                            <div
                                style={{
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                    marginTop: 4,
                                    fontSize: 12,
                                    color: "#888",
                                    maxWidth: 280,
                                }}
                            >
                                Phân loại: {variantText}
                            </div>
                        </div>
                    </Tooltip>
                );
            },
        },
        {
            title: "Đánh giá",
            dataIndex: "DiemDanhGia",
            key: "DiemDanhGia",
            width: "14%",
            align: "center",
            render: (diem) => (
                <Rate disabled value={Number(diem) || 0} style={{fontSize: 14}}/>
            ),
        },
        {
            title: "Nội dung",
            dataIndex: "NoiDung",
            key: "NoiDung",
            width: "28%",
            render: (text) => {
                const content = text || "Không có nội dung";

                return (
                    <Tooltip title={content}>
                        <div
                            style={{
                                ...ellipsisStyle,
                                WebkitLineClamp: 2,
                                lineHeight: "20px",
                                maxHeight: 40,
                                color: text ? "inherit" : "#aaa",
                                fontStyle: text ? "normal" : "italic",
                                maxWidth: 360,
                            }}
                        >
                            {content}
                        </div>
                    </Tooltip>
                );
            },
        },
        {
            title: "Mã đơn",
            key: "MaDonHang",
            width: "14%",
            align: "center",
            render: (_, record) => {
                const order = getOrder(record);
                const orderCode = order.MaHienThi || order.MaDonHang || "N/A";

                return (
                    <Tooltip title={orderCode}>
                        <div
                            style={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                maxWidth: 120,
                                margin: "0 auto",
                            }}
                        >
                            {orderCode}
                        </div>
                    </Tooltip>
                );
            },
        },
        {
            title: "Ngày đánh giá",
            key: "NgayGui",
            width: "14%",
            align: "center",
            render: (_, record) => {
                const date = record.NgayGui || record.createdAt;
                return date ? dayjs(date).format("DD/MM/YYYY HH:mm") : "N/A";
            },
        },
    ];

    return (
        <div className={styles.wrapper}>
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>Quản lý Đánh giá</h1>
                    <p className={styles.pageSub}>
                        Xem phản hồi và đánh giá từ khách hàng
                    </p>
                </div>
            </div>

            <div
                className={styles.toolbar}
                style={{
                    display: "flex",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 12,
                    width: "100%",
                }}
            >
                <Input
                    placeholder="Tìm nội dung, sản phẩm, biến thể, khách hàng, mã đơn..."
                    prefix={<SearchOutlined/>}
                    style={{
                        flex: "1 1 360px",
                        minWidth: 260,
                        borderRadius: 8,
                    }}
                    value={searchText}
                    onChange={(e) => {
                        setSearchText(e.target.value);
                        resetPagination();
                    }}
                    allowClear
                />

                <Select
                    placeholder="Lọc số sao"
                    style={{width: 130}}
                    value={filterRating}
                    onChange={(val) => {
                        setFilterRating(val);
                        resetPagination();
                    }}
                    allowClear
                >
                    <Option value={5}>5 Sao</Option>
                    <Option value={4}>4 Sao</Option>
                    <Option value={3}>3 Sao</Option>
                    <Option value={2}>2 Sao</Option>
                    <Option value={1}>1 Sao</Option>
                </Select>

                <Select
                    placeholder="Trạng thái"
                    style={{width: 130}}
                    value={filterStatus}
                    onChange={(val) => {
                        setFilterStatus(val);
                        resetPagination();
                    }}
                    allowClear
                >
                    <Option value={1}>Hiển thị</Option>
                    <Option value={0}>Đã ẩn</Option>
                </Select>

                <RangePicker
                    style={{
                        width: 260,
                        borderRadius: 8,
                    }}
                    format="DD/MM/YYYY"
                    value={dateRange}
                    onChange={(dates) => {
                        setDateRange(dates);
                        resetPagination();
                    }}
                    placeholder={["Từ ngày", "Đến ngày"]}
                    allowClear
                />

                <Button
                    type="primary"
                    icon={<DownloadOutlined/>}
                    onClick={handleExportReport}
                    loading={loadingExport}
                    style={{
                        borderRadius: 8,
                        height: 36,
                        whiteSpace: "nowrap",
                    }}
                >
                    Xuất báo cáo
                </Button>
            </div>

            <div className={styles.tableCard}>
                <Table
                    className={styles.table}
                    columns={columns}
                    dataSource={data}
                    pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: pagination.total,
                        showSizeChanger: false,
                        showTotal: (total) => `Tổng ${total} đánh giá`,
                    }}
                    loading={loadingTable}
                    onChange={handleTableChange}
                    rowKey="MaDanhGia"
                    scroll={{x: "max-content"}}
                />
            </div>
        </div>
    );
};

export default AdminReviews;
