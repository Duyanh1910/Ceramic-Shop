import { useState, useEffect } from "react";
import { Select, Input } from "antd";
import { EnvironmentOutlined } from '@ant-design/icons';
import axios from "axios";
import styles from "./AddressSelector.module.css";

const GHN_TOKEN = 'f65ff050-29e7-11f1-9f4b-f241d8a55f51';
const GHN_BASE = 'https://online-gateway.ghn.vn/shiip/public-api/master-data';
const GHN_HEADERS = { Token: GHN_TOKEN, 'Content-Type': 'application/json' };

export default function AddressSelector({ onChange, disabled = false }) {
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    const [provinceId, setProvinceId] = useState(null);
    const [districtId, setDistrictId] = useState(null);
    const [wardId, setWardId] = useState(null);

    const [provinceName, setProvinceName] = useState("");
    const [districtName, setDistrictName] = useState("");
    const [wardName, setWardName] = useState("");
    const [detail, setDetail] = useState('');

    const [loadingP, setLoadingP] = useState(false);
    const [loadingD, setLoadingD] = useState(false);
    const [loadingW, setLoadingW] = useState(false);

    useEffect(() => { fetchProvinces(); }, []);

    useEffect(() => {
        const parts = [detail.trim(), wardName, districtName, provinceName].filter(Boolean);
        const addressString = parts.join(', ') || '';
        
        const addressObj = {
            ToProvinceID: provinceId,
            ToDistrictID: districtId,
            ToWardID: wardId
        };

        if (onChange) onChange(addressString, addressObj);
    }, [provinceId, districtId, wardId, provinceName, districtName, wardName, detail]);

    const fetchProvinces = async () => {
        setLoadingP(true);
        try {
            const res = await axios.get(`${GHN_BASE}/province`, { headers: GHN_HEADERS });
            setProvinces((res.data?.data || []).map((p) => ({ value: p.ProvinceID, label: p.ProvinceName })));
        } catch { setProvinces([]); }
        finally { setLoadingP(false); }
    };

    const fetchDistricts = async (pId) => {
        setLoadingD(true);
        try {
            const res = await axios.get(`${GHN_BASE}/district?province_id=${pId}`, { headers: GHN_HEADERS });
            setDistricts((res.data?.data || []).map((d) => ({ value: d.DistrictID, label: d.DistrictName })));
        } catch { setDistricts([]); }
        finally { setLoadingD(false); }
    };

    const fetchWards = async (dId) => {
        setLoadingW(true);
        try {
            const res = await axios.get(`${GHN_BASE}/ward?district_id=${dId}`, { headers: GHN_HEADERS });
            setWards((res.data?.data || []).map((w) => ({ value: w.WardCode, label: w.WardName })));
        } catch { setWards([]); }
        finally { setLoadingW(false); }
    };

    const handleProvince = (val, opt) => {
        setProvinceId(val);
        setProvinceName(opt.label);
        setDistrictId(null); setDistrictName("");
        setWardId(null); setWardName("");
        setWards([]);
        fetchDistricts(val);
    };

    const handleDistrict = (val, opt) => {
        setDistrictId(val);
        setDistrictName(opt.label);
        setWardId(null); setWardName("");
        fetchWards(val);
    };

    const handleWard = (val, opt) => {
        setWardId(val);
        setWardName(opt.label);
    };

    const filterOption = (input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase());

    const previewParts = [detail.trim(), wardName, districtName, provinceName].filter(Boolean);

    return (
        <div className={styles.wrapper}>
            <div className={styles.grid}>
                <div className={styles.field}>
                    <label className={styles.label}>Tỉnh/ Thành phố <span className={styles.req}>*</span></label>
                    <Select
                        showSearch
                        placeholder="Chọn tỉnh/thành"
                        options={provinces}
                        onChange={handleProvince}
                        filterOption={filterOption}
                        loading={loadingP}
                        value={provinceId}
                        disabled={disabled || loadingP}
                        className={styles.select}
                    />
                </div>
                <div className={styles.field}>
                    <label className={styles.label}>Quận/ Huyện <span className={styles.req}>*</span></label>
                    <Select
                        showSearch
                        placeholder="Chọn quận/huyện"
                        options={districts}
                        onChange={handleDistrict}
                        filterOption={filterOption}
                        disabled={!provinceId || disabled || loadingD}
                        loading={loadingD}
                        value={districtId}
                        className={styles.select}
                    />
                </div>
                <div className={styles.field}>
                    <label className={styles.label}>Phường/ Xã <span className={styles.req}>*</span></label>
                    <Select
                        showSearch
                        placeholder="Chọn phường/xã"
                        options={wards}
                        onChange={handleWard}
                        filterOption={filterOption}
                        disabled={!districtId || disabled || loadingW}
                        value={wardId}
                        loading={loadingW}
                        className={styles.select}
                    />
                </div>
            </div>

            <div className={styles.field} style={{ marginTop: 12 }}>
                <label className={styles.label}>Số nhà, tên đường <span className={styles.req}>*</span></label>
                <Input
                    prefix={<EnvironmentOutlined style={{ color: '#bbb' }} />}
                    placeholder="VD: Số 12/39; Tổ Dân Phố Khúc Trì 1"
                    value={detail}
                    onChange={(e) => setDetail(e.target.value)}
                    disabled={disabled}
                    className={styles.input}
                />
            </div>
            {previewParts.length > 0 && (
                <div className={styles.preview}>
                    <EnvironmentOutlined className={styles.previewIcon} />
                    <span className={styles.previewText}>{previewParts.join(', ')}</span>
                </div>
            )}
        </div>
    );
}