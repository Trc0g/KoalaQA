import {
  getAdminSystemLoginMethod,
  ModelAuth,
  ModelAuthConfig,
  ModelAuthInfo,
  putAdminSystemLoginMethod,
} from '@/api';
import Card from '@/components/card';
import { message } from '@ctzhian/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormHelperText,
  IconButton,
  InputAdornment,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useRequest } from 'ahooks';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

// 登录方式类型枚举
enum AuthType {
  PASSWORD = 1, // 密码认证
  OIDC = 2, // OIDC认证
}

// 登录方式选项
const AUTH_TYPE_OPTIONS = [
  { label: '密码认证', value: AuthType.PASSWORD },
  { label: 'OIDC', value: AuthType.OIDC },
];

// Zod 验证模式
const loginMethodSchema = z.object({
  enable_register: z.boolean(),
  public_access: z.boolean(),
  auth_types: z
    .array(z.number())
    .min(1, '至少需要选择一个登录方式')
    .refine(types => types.length > 0, '至少需要选择一个登录方式'),
  password_config: z
    .object({
      button_desc: z.string().optional(),
    })
    .optional(),
  oidc_config: z
    .object({
      url: z.string().url('请输入有效的URL地址').optional().or(z.literal('')),
      client_id: z.string().optional(),
      client_secret: z.string().optional(),
      button_desc: z.string().optional(),
    })
    .optional(),
});

type LoginMethodFormData = z.infer<typeof loginMethodSchema>;

const LoginMethod: React.FC = () => {
  const [showClientSecret, setShowClientSecret] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm<LoginMethodFormData>({
    resolver: zodResolver(loginMethodSchema),
    defaultValues: {
      enable_register: true,
      public_access: true,
      auth_types: [AuthType.PASSWORD],
      password_config: {
        button_desc: '密码登录',
      },
      oidc_config: {
        url: '',
        client_id: '',
        client_secret: '',
        button_desc: 'OIDC 登录',
      },
    },
  });

  const watchedAuthTypes = watch('auth_types');
  const isPasswordSelected = watchedAuthTypes?.includes(AuthType.PASSWORD) ?? false;
  const isOidcSelected = watchedAuthTypes?.includes(AuthType.OIDC) ?? false;

  // 获取当前配置
  const { loading } = useRequest(getAdminSystemLoginMethod, {
    onSuccess: res => {
      if (res) {
        const { enable_register, public_access, auth_infos } = res;

        // 从 auth_infos 中提取认证类型和配置
        const authTypes = auth_infos?.map((info: ModelAuthInfo) => info.type).filter(Boolean) ?? [
          AuthType.PASSWORD,
        ];

        // 获取密码认证配置
        const passwordInfo = auth_infos?.find(
          (info: ModelAuthInfo) => info.type === AuthType.PASSWORD
        );
        const passwordConfig = {
          button_desc: passwordInfo?.button_desc ?? '密码登录',
        };

        // 获取 OIDC 配置
        const oidcInfo = auth_infos?.find((info: ModelAuthInfo) => info.type === AuthType.OIDC);
        const oidcConfig = {
          url: oidcInfo?.config?.oauth?.url ?? '',
          client_id: oidcInfo?.config?.oauth?.client_id ?? '',
          client_secret: oidcInfo?.config?.oauth?.client_secret ?? '',
          button_desc: oidcInfo?.button_desc ?? 'OIDC 登录',
        };

        reset({
          enable_register: enable_register ?? true,
          public_access: public_access ?? true,
          auth_types: authTypes as number[],
          password_config: passwordConfig,
          oidc_config: oidcConfig,
        });
      }
    },
    onError: () => {
      message.error('加载登录配置失败');
    },
  });

  const onSubmit = async (formData: LoginMethodFormData) => {
    try {
      // 验证OIDC配置
      if (formData.auth_types.includes(AuthType.OIDC)) {
        if (
          !formData.oidc_config?.url ||
          !formData.oidc_config?.client_id ||
          !formData.oidc_config?.client_secret
        ) {
          message.error('请完善OIDC配置信息');
          return;
        }
      }

      // 构建认证信息
      const authInfos: ModelAuthInfo[] = formData.auth_types.map(type => {
        const authInfo: ModelAuthInfo = { type };

        if (type === AuthType.PASSWORD) {
          authInfo.button_desc = formData.password_config?.button_desc || '密码登录';
        } else if (type === AuthType.OIDC && formData.oidc_config) {
          authInfo.button_desc = formData.oidc_config.button_desc || 'OIDC 登录';
          const config: ModelAuthConfig = {
            oauth: {
              url: formData.oidc_config.url || '',
              client_id: formData.oidc_config.client_id || '',
              client_secret: formData.oidc_config.client_secret || '',
            },
          };
          authInfo.config = config;
        }

        return authInfo;
      });

      const requestData: ModelAuth = {
        enable_register: formData.enable_register,
        public_access: formData.public_access,
        auth_infos: authInfos,
      };

      await putAdminSystemLoginMethod(requestData);
      message.success('登录配置保存成功');

      // 重新获取数据以更新表单状态
      reset(formData);
    } catch (error) {
      message.error('保存登录配置失败');
      console.error('Save login method config error:', error);
    }
  };

  const handleRemoveAuthType = (valueToRemove: number) => {
    const currentTypes = watch('auth_types') || [];
    const newTypes = currentTypes.filter(value => value !== valueToRemove);

    if (newTypes.length === 0) {
      message.error('至少需要选择一个登录方式');
      return;
    }

    setValue('auth_types', newTypes, { shouldValidate: true, shouldDirty: true });
  };

  return (
    <Card sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography
          sx={{
            fontSize: 14,
            lineHeight: '32px',
            flexShrink: 0,
          }}
          variant="subtitle2"
        >
          登录注册管理
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {isDirty && (
            <Button
              type="submit"
              variant="contained"
              size="small"
              disabled={loading}
              onClick={handleSubmit(onSubmit)}
            >
              保存
            </Button>
          )}
        </Box>
      </Box>

      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <Stack>
          {/* 用户注册复选框 */}
          <Box display="flex" alignItems="center">
            <Typography variant="body2" sx={{ mr: 2, minWidth: 160 }}>
              开放用户注册
            </Typography>
            <Controller
              name="enable_register"
              control={control}
              render={({ field }) => (
                <Checkbox
                  sx={theme => ({
                    '& svg[data-testid="CheckBoxIcon"]': {
                      fill: theme.palette.info.main,
                    },
                  })}
                  checked={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </Box>

          {/* 公开访问开关 */}
          <Box display="flex" alignItems="center">
            <Typography variant="body2" sx={{ mr: 2, minWidth: 160 }}>
              公开访问
            </Typography>
            <Controller
              name="public_access"
              control={control}
              render={({ field }) => (
                <Checkbox
                  checked={field.value}
                  onChange={field.onChange}
                  sx={theme => ({
                    '& svg[data-testid="CheckBoxIcon"]': {
                      fill: theme.palette.info.main,
                    },
                  })}
                />
              )}
            />
          </Box>

          {/* 登录方式选择 */}
          <Box display="flex" alignItems="center">
            <Typography variant="body2" sx={{ mr: 2, minWidth: 170 }}>
              登录方式
            </Typography>
            <Box flex={1}>
              <FormControl fullWidth error={!!errors.auth_types}>
                <Controller
                  name="auth_types"
                  control={control}
                  render={({ field }) => (
                    <Select
                      multiple
                      value={field.value || []}
                      onChange={field.onChange}
                      input={<OutlinedInput />}
                      sx={{
                        '& .MuiSelect-select': {
                          py: 1,
                        },
                      }}
                      renderValue={selected => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {(selected as number[]).map(value => {
                            const option = AUTH_TYPE_OPTIONS.find(opt => opt.value === value);
                            return (
                              <Box
                                key={value}
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 0.5,
                                  backgroundColor: '#FFFFFF',
                                  borderRadius: '16px',
                                  padding: '2px 8px',
                                  fontSize: '12px',
                                  color: '#333333',
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  sx={{ fontSize: '12px', lineHeight: 'normal' }}
                                >
                                  {option?.label}
                                </Typography>
                                <IconButton
                                  size="small"
                                  onClick={e => {
                                    e.stopPropagation();
                                    handleRemoveAuthType(value);
                                  }}
                                  sx={{
                                    padding: '2px',
                                    ml: 0.5,
                                    bgcolor: '#ccc',
                                    color: 'white',
                                    height: '12px',
                                    fontSize: '14px',
                                    lineHeight: '15px',
                                    flexShrink: 0,
                                  }}
                                >
                                  ×
                                </IconButton>
                              </Box>
                            );
                          })}
                        </Box>
                      )}
                    >
                      {AUTH_TYPE_OPTIONS.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
                {errors.auth_types && <FormHelperText>{errors.auth_types.message}</FormHelperText>}
              </FormControl>
            </Box>
          </Box>

          {/* 密码认证配置 */}
          {isPasswordSelected && (
            <>
              <Box
                sx={{
                  borderTop: '1px dashed #e0e0e0',
                  mt: 3,
                }}
              />
              <Box
                sx={{
                  borderRadius: 1,
                  backgroundColor: 'white',
                  py: 3,
                  minHeight: 64,
                }}
              >
                <Box
                  sx={{
                    left: 16,
                    backgroundColor: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    py: 0,
                    fontSize: 14,
                  }}
                >
                  <Box
                    sx={{
                      width: 4,
                      height: 12,
                      borderRadius: 1,
                      background: 'linear-gradient(180deg, #2458E5 0%, #5B8FFC 100%)',
                      mr: 1,
                      display: 'inline-block',
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 500,
                      color: '#21222D',
                      fontSize: 14,
                    }}
                  >
                    密码认证配置
                  </Typography>
                </Box>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mt: 2 }}>
                  <Typography variant="body2" sx={{ minWidth: 170 }}>
                    登录按钮文案
                  </Typography>
                  <Box sx={{ flex: 1 }}>
                    <Controller
                      name="password_config.button_desc"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          placeholder="请输入"
                          fullWidth
                          size="small"
                          InputLabelProps={{
                            shrink: false,
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: '#F8F9FA',
                              borderRadius: '10px',
                            },
                            '& .MuiInputBase-input': {
                              fontSize: 14,
                            },
                          }}
                        />
                      )}
                    />
                  </Box>
                </Stack>
              </Box>
            </>
          )}

          {/* OIDC 配置 */}
          {isOidcSelected && (
            <>
              <Box
                sx={{
                  borderTop: '1px dashed #e0e0e0',
                }}
              />
              <Box
                sx={{
                  borderRadius: 1,
                  backgroundColor: 'white',
                  py: 3,
                  minHeight: 64,
                }}
              >
                <Box
                  sx={{
                    left: 16,
                    backgroundColor: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    py: 0,
                    fontSize: 14,
                  }}
                >
                  <Box
                    sx={{
                      width: 4,
                      height: 12,
                      borderRadius: 1,
                      background: 'linear-gradient(180deg, #2458E5 0%, #5B8FFC 100%)',
                      mr: 1,
                      display: 'inline-block',
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 500,
                      color: '#21222D',
                      fontSize: 14,
                    }}
                  >
                    OIDC 配置
                  </Typography>
                </Box>
              </Box>

              <Stack spacing={1.5}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Typography variant="body2" sx={{ minWidth: 170 }}>
                    服务器地址<span style={{ color: 'red' }}>*</span>
                  </Typography>
                  <Box sx={{ flex: 1 }}>
                    <Controller
                      name="oidc_config.url"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          placeholder="请输入"
                          required
                          fullWidth
                          type="url"
                          size="small"
                          error={!!errors.oidc_config?.url}
                          helperText={errors.oidc_config?.url?.message}
                          InputLabelProps={{
                            shrink: false,
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: '#F8F9FA',
                              borderRadius: '10px',
                            },
                            '& .MuiInputBase-input': {
                              fontSize: 14,
                            },
                          }}
                        />
                      )}
                    />
                  </Box>
                </Stack>

                <Stack direction="row" alignItems="center" spacing={2}>
                  <Typography variant="body2" sx={{ minWidth: 170 }}>
                    Client ID<span style={{ color: 'red' }}>*</span>
                  </Typography>
                  <Box sx={{ flex: 1 }}>
                    <Controller
                      name="oidc_config.client_id"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          placeholder="请输入"
                          required
                          fullWidth
                          size="small"
                          InputLabelProps={{
                            shrink: false,
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: '#F8F9FA',
                              borderRadius: '10px',
                            },
                            '& .MuiInputBase-input': {
                              fontSize: 14,
                            },
                          }}
                        />
                      )}
                    />
                  </Box>
                </Stack>

                <Stack direction="row" alignItems="center" spacing={2}>
                  <Typography variant="body2" sx={{ minWidth: 170 }}>
                    Client Secret<span style={{ color: 'red' }}>*</span>
                  </Typography>
                  <Box sx={{ flex: 1 }}>
                    <Controller
                      name="oidc_config.client_secret"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          placeholder="请输入"
                          required
                          fullWidth
                          type={showClientSecret ? 'text' : 'password'}
                          size="small"
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  aria-label="toggle client secret visibility"
                                  onClick={() => setShowClientSecret(!showClientSecret)}
                                  onMouseDown={event => event.preventDefault()}
                                  edge="end"
                                  size="small"
                                >
                                  {showClientSecret ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                          InputLabelProps={{
                            shrink: false,
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: '#F8F9FA',
                              borderRadius: '10px',
                            },
                            '& .MuiInputBase-input': {
                              fontSize: 14,
                            },
                          }}
                        />
                      )}
                    />
                  </Box>
                </Stack>

                <Stack direction="row" alignItems="center" spacing={2}>
                  <Typography variant="body2" sx={{ minWidth: 170 }}>
                    按钮文案
                  </Typography>
                  <Box sx={{ flex: 1 }}>
                    <Controller
                      name="oidc_config.button_desc"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          placeholder="请输入"
                          fullWidth
                          size="small"
                          InputLabelProps={{
                            shrink: false,
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: '#F8F9FA',
                              borderRadius: '10px',
                            },
                            '& .MuiInputBase-input': {
                              fontSize: 14,
                            },
                          }}
                        />
                      )}
                    />
                  </Box>
                </Stack>
              </Stack>
            </>
          )}
        </Stack>
      </Box>
    </Card>
  );
};

export default LoginMethod;
