import { useState, useEffect } from 'react';
import { Select, Input, Spin } from 'antd';
import { EnvironmentOutlined } from '@ant-design/icons';
import axios from 'axios';
import styles from './AddressSelector.module.css';

const GHN_TOKEN = 'f65ff050-29e7-11f1-9f4b-f241d8a55f51';
const GHN_BASE  = 'https://online-gateway.ghn.vn/shiip/public-api/master-data';
const GHN_HDR   = { Token: GHN_TOKEN, 'Content-Type': 'application/json' };

export default function AddressSelector({ onChange, disabled = false }) {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards,     setWards]     = useState([]);

  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedWard,     setSelectedWard]     = useState(null);
  const [detail,           setDetail]           = useState('');

  const [loadingP, setLoadingP] = useState(false);
  const [loadingD, setLoadingD] = useState(false);
  const [loadingW, setLoadingW] = useState(false);

  useEffect(() => { fetchProvinces(); }, []);

  useEffect(() => {
    const parts = [detail.trim(), selectedWard?.label, selectedDistrict?.label, selectedProvince?.label].filter(Boolean);
    const str = parts.join(', ') || '';
    const obj = (selectedDistrict && selectedWard)
      ? { ToProvinceID: selectedProvince?.id, ToDistrictID: selectedDistrict?.id, ToWardID: selectedWard?.id }
      : null;
    if (onChange) onChange(str, obj);
  }, [selectedProvince, selectedDistrict, selectedWard, detail]);

  const fetchProvinces = async () => {
    setLoadingP(true);
    try {
      const res = await axios.get(`${GHN_BASE}/province`, { headers: GHN_HDR });
      setProvinces((res.data?.data || []).map(p => ({ value: p.ProvinceID, label: p.ProvinceName })));
    } catch { setProvinces([]); }
    finally { setLoadingP(false); }
  };

  const fetchDistricts = async (provinceId) => {
    setLoadingD(true);
    setDistricts([]); setWards([]);
    setSelectedDistrict(null); setSelectedWard(null);
    try {
      const res = await axios.get(`${GHN_BASE}/district?province_id=${provinceId}`, { headers: GHN_HDR });
      setDistricts((res.data?.data || []).map(d => ({ value: d.DistrictID, label: d.DistrictName })));
    } catch { setDistricts([]); }
    finally { setLoadingD(false); }
  };

  const fetchWards = async (districtId) => {
    setLoadingW(true);
    setWards([]); setSelectedWard(null);
    try {
      const res = await axios.get(`${GHN_BASE}/ward?district_id=${districtId}`, { headers: GHN_HDR });
      setWards((res.data?.data || []).map(w => ({ value: w.WardCode, label: w.WardName })));
    } catch { setWards([]); }
    finally { setLoadingW(false); }
  };

  const filterOpt = (input, option) =>
    (option?.label ?? '').toLowerCase().includes(input.toLowerCase());

  const handleProvince = (val, opt) => {
    setSelectedProvince({ id: val, label: opt.label });
    setSelectedDistrict(null); setSelectedWard(null);
    fetchDistricts(val);
  };

  const handleDistrict = (val, opt) => {
    setSelectedDistrict({ id: val, label: opt.label });
    setSelectedWard(null);
    fetchWards(val);
  };

  const handleWard = (val, opt) => {
    setSelectedWard({ id: val, label: opt.label });
  };

  const previewParts = [detail.trim(), selectedWard?.label, selectedDistrict?.label, selectedProvince?.label].filter(Boolean);

  return (
    <div className={styles.wrapper}>
      <div className={styles.grid}>
        <div className={styles.field}>
          <label className={styles.label}>Tỉnh / Thành phố <span className={styles.req}>*</span></label>
          <Select showSearch placeholder={loadingP ? 'Đang tải...' : 'Chọn tỉnh/thành'}
            options={provinces} onChange={handleProvince} filterOption={filterOpt}
            loading={loadingP} disabled={disabled || loadingP} className={styles.select} />
            value={selectedProvince?.id ?? undefined}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Quận / Huyện <span className={styles.req}>*</span></label>
          <Select showSearch placeholder={loadingD ? 'Đang tải...' : 'Chọn quận/huyện'}
            options={districts} onChange={handleDistrict} filterOption={filterOpt}
            disabled={!selectedProvince || disabled || loadingD} loading={loadingD}
            value={selectedDistrict?.id ?? undefined} className={styles.select} />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Phường / Xã <span className={styles.req}>*</span></label>
          <Select showSearch placeholder={loadingW ? 'Đang tải...' : 'Chọn phường/xã'}
            options={wards} onChange={handleWard} filterOption={filterOpt}
            disabled={!selectedDistrict || disabled || loadingW} loading={loadingW}
            value={selectedWard?.id ?? undefined} className={styles.select} />
        </div>
      </div>

      <div className={styles.field} style={{ marginTop: 12 }}>
        <label className={styles.label}>Số nhà, tên đường <span className={styles.req}>*</span></label>
        <Input prefix={<EnvironmentOutlined style={{ color: '#bbb' }} />}
          placeholder="VD: 123 Đường Lê Lợi" value={detail}
          onChange={(e) => setDetail(e.target.value)}
          disabled={disabled} className={styles.input} />
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