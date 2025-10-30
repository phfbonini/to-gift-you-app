import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Image,
  Keyboard,
  TextInput as RNTextInput,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  useTheme,
  ActivityIndicator,
  HelperText,
} from 'react-native-paper';
import { StackScreenProps } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
// import * as ImagePicker from 'expo-image-picker'; // Desativado temporariamente - será usado com AWS S3
import { profileService, UserProfile, ProfileUpdateRequest } from '../services/profileService';
import { colors } from '../theme/colors';

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  ForgotPassword: undefined;
  ValidateCode: { email: string };
  ValidateEmailCode: { newEmail: string };
  ResetPassword: { token: string };
  Profile: { userId: number };
  EditProfile: { profile: UserProfile };
};
type EditProfileScreenProps = StackScreenProps<RootStackParamList, 'EditProfile'>;

export const EditProfileScreen: React.FC<EditProfileScreenProps> = ({ navigation, route }) => {
  const theme = useTheme();
  const { profile: initialProfile } = route.params;

  const usernameRef = useRef<RNTextInput>(null);
  const nomeRef = useRef<RNTextInput>(null);
  const bioRef = useRef<RNTextInput>(null);

  const [username, setUsername] = useState(initialProfile.username || '');
  const [nome, setNome] = useState(initialProfile.nome || '');
  const [newEmail, setNewEmail] = useState('');
  const [bio, setBio] = useState(initialProfile.bio || '');
  const [fotoPerfil] = useState(initialProfile.fotoPerfil || ''); // Apenas para exibição, não editável
  // Upload de foto desativado temporariamente - será implementado com AWS S3
  // const [localImageUri, setLocalImageUri] = useState<string | null>(null);
  // const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [website, setWebsite] = useState(initialProfile.links?.website || '');
  const [instagram, setInstagram] = useState(initialProfile.links?.instagram || '');
  const [twitter, setTwitter] = useState(initialProfile.links?.twitter || '');
  const [linkedin, setLinkedin] = useState(initialProfile.links?.linkedin || '');

  const [errors, setErrors] = useState({
    username: '',
    nome: '',
    bio: '',
    website: '',
    instagram: '',
    twitter: '',
    linkedin: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  // const [uploadingPhoto, setUploadingPhoto] = useState(false); // Upload desativado temporariamente
  const usernameCheckTimeout = useRef<NodeJS.Timeout | null>(null);

  const validateField = (field: keyof typeof errors, value: string): string => {
    switch (field) {
      case 'username':
        if (value.trim().length > 0 && value.trim().length < 3) {
          return 'Username deve ter pelo menos 3 caracteres';
        }
        if (value.trim().length > 30) {
          return 'Username não pode ter mais de 30 caracteres';
        }
        if (usernameAvailable === false) {
          return 'Username já está em uso';
        }
        return '';
      case 'nome':
        if (value.trim().length > 0 && value.trim().length < 3) {
          return 'Nome deve ter pelo menos 3 caracteres';
        }
        if (value.trim().length > 100) {
          return 'Nome não pode ter mais de 100 caracteres';
        }
        return '';
      case 'bio':
        if (value.length > 500) {
          return 'Bio não pode ter mais de 500 caracteres';
        }
        return '';
      case 'website':
      case 'instagram':
      case 'twitter':
      case 'linkedin':
        if (value.trim() && !isValidUrl(value)) {
          return 'URL inválida';
        }
        return '';
      default:
        return '';
    }
  };

  const isValidUrl = (url: string): boolean => {
    if (!url.trim()) return true;
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleBlur = (field: keyof typeof errors, value: string) => {
    const errorMsg = validateField(field, value);
    setErrors((e) => ({ ...e, [field]: errorMsg }));
  };

  const checkUsernameAvailability = async (username: string) => {
    if (username.trim().length < 3 || username.trim() === initialProfile.username) {
      setUsernameAvailable(null);
      return;
    }

    setIsCheckingUsername(true);
    try {
      const response = await profileService.checkUsernameAvailability(username.trim());
      setUsernameAvailable(response.available);
      if (!response.available) {
        setErrors((e) => ({ ...e, username: 'Username já está em uso' }));
      } else {
        setErrors((e) => ({ ...e, username: '' }));
      }
    } catch (error: any) {
      console.error('Erro ao verificar username:', error);
      setUsernameAvailable(null);
    } finally {
      setIsCheckingUsername(false);
    }
  };

  const handleUsernameChange = (value: string) => {
    setUsername(value);
    setUsernameAvailable(null);
    
    if (value.trim().length > 0 && value.trim().length < 3) {
      setErrors((e) => ({ ...e, username: 'Username deve ter pelo menos 3 caracteres' }));
      return;
    }
    if (value.trim().length > 30) {
      setErrors((e) => ({ ...e, username: 'Username não pode ter mais de 30 caracteres' }));
      return;
    }

    setErrors((e) => ({ ...e, username: '' }));

    if (usernameCheckTimeout.current) {
      clearTimeout(usernameCheckTimeout.current);
    }
    usernameCheckTimeout.current = setTimeout(() => {
      checkUsernameAvailability(value);
    }, 500);
  };

  // Upload de foto desativado temporariamente - será implementado com AWS S3
  // const handlePickImage = async () => {
  //   try {
  //     const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  //     if (status !== 'granted') {
  //       Alert.alert('Permissão necessária', 'Precisamos de acesso à sua galeria para selecionar uma foto.');
  //       return;
  //     }

  //     const result = await ImagePicker.launchImageLibraryAsync({
  //       mediaTypes: 'images',
  //       allowsEditing: true,
  //       aspect: [1, 1],
  //       quality: 0.8,
  //     });

  //     if (!result.canceled && result.assets[0]) {
  //       const uri = result.assets[0].uri;
  //       setLocalImageUri(uri);

  //       setUploadingPhoto(true);
  //       try {
  //         const imageUrl = await profileService.uploadPhoto(uri);
  //         setFotoPerfil(imageUrl);
  //         setLocalImageUri(null);
  //       } catch (error: any) {
  //         console.error('Erro ao fazer upload:', error);
  //         Alert.alert('Erro', error.message || 'Erro ao fazer upload da foto');
  //         setLocalImageUri(null);
  //       } finally {
  //         setUploadingPhoto(false);
  //       }
  //     }
  //   } catch (error: any) {
  //     console.error('Erro ao selecionar imagem:', error);
  //     Alert.alert('Erro', 'Erro ao selecionar imagem');
  //   }
  // };

  const handleRequestEmailChange = async () => {
    if (!newEmail.trim()) {
      Alert.alert('Erro', 'Por favor, insira o novo email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail.trim())) {
      Alert.alert('Erro', 'Por favor, insira um email válido');
      return;
    }

    try {
      setIsLoading(true);
      await profileService.requestEmailChange(newEmail.trim());
      Alert.alert(
        'Email enviado',
        'Código de confirmação enviado para o novo email. Verifique sua caixa de entrada.',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.navigate('ValidateEmailCode', { newEmail: newEmail.trim() });
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Erro ao solicitar mudança de email:', error);
      Alert.alert('Erro', error.message || 'Erro ao solicitar mudança de email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    Keyboard.dismiss();

    const newErrors = {
      username: validateField('username', username),
      nome: validateField('nome', nome),
      bio: validateField('bio', bio),
      website: validateField('website', website),
      instagram: validateField('instagram', instagram),
      twitter: validateField('twitter', twitter),
      linkedin: validateField('linkedin', linkedin),
    };

    setErrors(newErrors);

    if (Object.values(newErrors).some((e) => e.length > 0)) {
      if (newErrors.username) usernameRef.current?.focus();
      else if (newErrors.nome) nomeRef.current?.focus();
      else if (newErrors.bio) bioRef.current?.focus();
      return;
    }

    if (username.trim() !== initialProfile.username && usernameAvailable === null && username.trim().length >= 3) {
      Alert.alert('Aguarde', 'Verificando disponibilidade do username...');
      return;
    }

    if (usernameAvailable === false) {
      Alert.alert('Erro', 'Username já está em uso');
      return;
    }

    setIsLoading(true);

    try {
      const updateData: ProfileUpdateRequest = {
        username: username.trim() !== initialProfile.username ? username.trim() : undefined,
        nome: nome.trim() || undefined,
        bio: bio.trim() || undefined,
        // fotoPerfil desativado temporariamente - será implementado com AWS S3
        // fotoPerfil: fotoPerfil && fotoPerfil.trim() ? fotoPerfil.trim() : undefined,
        links: {
          website: website.trim() || undefined,
          instagram: instagram.trim() || undefined,
          twitter: twitter.trim() || undefined,
          linkedin: linkedin.trim() || undefined,
        },
      };
      
      // Log para debug
      console.log('📤 Dados sendo enviados:', JSON.stringify(updateData, null, 2));

      await profileService.updateProfile(updateData);

      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!', [
        {
          text: 'OK',
          onPress: () => {
            navigation.goBack();
          },
        },
      ]);
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      if (error.message?.includes('Username já está em uso')) {
        setErrors((e) => ({ ...e, username: 'Username já está em uso' }));
        setUsernameAvailable(false);
        usernameRef.current?.focus();
      }
      Alert.alert('Erro', error.message || 'Erro ao atualizar perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const renderAvatar = () => {
    // Usar fotoPerfil existente (sem preview de upload, pois está desativado)
    const imageUri = fotoPerfil;
    
    if (imageUri) {
      return (
        <Image
          source={{ uri: imageUri }}
          style={styles.avatar}
          resizeMode="cover"
          onError={(error) => {
            console.error('❌ Erro ao carregar imagem:', error.nativeEvent.error);
          }}
        />
      );
    }

    const initials = nome
      .split(' ')
      .map((name) => name.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);

    return (
      <View style={[styles.avatar, styles.defaultAvatar]}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={[styles.cancelButton, { color: colors.primary }]}>Cancelar</Text>
            </TouchableOpacity>
            <Text variant="titleLarge" style={[styles.title, { color: colors.text.secondary }]}>
              Editar Perfil
            </Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              {renderAvatar()}
            </View>
            {/* Upload de foto desativado temporariamente - será implementado com AWS S3 */}
            {/* <TouchableOpacity
              onPress={handlePickImage}
              disabled={uploadingPhoto || isLoading}
            >
              <Text style={[styles.changePhotoText, { color: colors.primary }]}>
                {uploadingPhoto ? 'Enviando...' : 'Alterar foto'}
              </Text>
            </TouchableOpacity> */}
          </View>

          {/* Username */}
          <TextInput
            ref={usernameRef}
            label="Username"
            value={username}
            onChangeText={handleUsernameChange}
            onBlur={() => handleBlur('username', username)}
            error={!!errors.username}
            mode="outlined"
            autoCapitalize="none"
            disabled={isLoading}
            left={<TextInput.Icon icon="at" />}
            style={[styles.input, { backgroundColor: colors.background }]}
            theme={{
              colors: {
                primary: colors.primary,
                error: colors.error,
                outline: colors.border,
                onSurface: colors.text.primary,
                onSurfaceVariant: colors.text.secondary,
              }
            }}
          />
          <HelperText type="error" visible={!!errors.username} theme={{ colors: { error: colors.error } }}>
            {errors.username}
          </HelperText>
          {isCheckingUsername && (
            <HelperText type="info" visible={true} theme={{ colors: { onSurface: colors.text.secondary } }}>
              Verificando disponibilidade...
            </HelperText>
          )}
          {usernameAvailable === true && username.trim().length >= 3 && (
            <HelperText type="info" visible={true} style={styles.successText}>
              ✓ Username disponível
            </HelperText>
          )}

          {/* Email */}
          <TextInput
            label="Novo Email"
            value={newEmail}
            onChangeText={setNewEmail}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            disabled={isLoading}
            left={<TextInput.Icon icon="email-outline" />}
            style={[styles.input, { backgroundColor: colors.background }]}
            theme={{
              colors: {
                primary: colors.primary,
                error: colors.error,
                outline: colors.border,
                onSurface: colors.text.primary,
                onSurfaceVariant: colors.text.secondary,
              }
            }}
          />
          <HelperText type="info" visible={true} theme={{ colors: { onSurface: colors.text.secondary } }}>
            Um código de confirmação será enviado para o novo email
          </HelperText>
          <Button
            mode="outlined"
            onPress={handleRequestEmailChange}
            disabled={isLoading || !newEmail.trim()}
            style={styles.emailButton}
          >
            Enviar Código
          </Button>

          {/* Nome */}
          <TextInput
            ref={nomeRef}
            label="Nome completo"
            value={nome}
            onChangeText={setNome}
            onBlur={() => handleBlur('nome', nome)}
            error={!!errors.nome}
            mode="outlined"
            disabled={isLoading}
            left={<TextInput.Icon icon="account-outline" />}
            style={[styles.input, { backgroundColor: colors.background }]}
            theme={{
              colors: {
                primary: colors.primary,
                error: colors.error,
                outline: colors.border,
                onSurface: colors.text.primary,
                onSurfaceVariant: colors.text.secondary,
              }
            }}
          />
          <HelperText type="error" visible={!!errors.nome} theme={{ colors: { error: colors.error } }}>
            {errors.nome}
          </HelperText>

          {/* Bio */}
          <TextInput
            ref={bioRef}
            label="Bio"
            value={bio}
            onChangeText={setBio}
            onBlur={() => handleBlur('bio', bio)}
            error={!!errors.bio}
            mode="outlined"
            multiline
            numberOfLines={4}
            disabled={isLoading}
            left={<TextInput.Icon icon="pencil-outline" />}
            style={[styles.input, { backgroundColor: colors.background }]}
            maxLength={500}
            theme={{
              colors: {
                primary: colors.primary,
                error: colors.error,
                outline: colors.border,
                onSurface: colors.text.primary,
                onSurfaceVariant: colors.text.secondary,
              }
            }}
          />
          <HelperText type="info" visible={true} theme={{ colors: { onSurface: colors.text.secondary } }}>
            {bio.length}/500 caracteres
          </HelperText>
          <HelperText type="error" visible={!!errors.bio} theme={{ colors: { error: colors.error } }}>
            {errors.bio}
          </HelperText>

          {/* Links Sociais */}
          <Text variant="titleMedium" style={[styles.sectionTitle, { color: colors.text.primary }]}>
            Links Sociais
          </Text>

          <TextInput
            label="Website"
            value={website}
            onChangeText={setWebsite}
            onBlur={() => handleBlur('website', website)}
            error={!!errors.website}
            mode="outlined"
            keyboardType="url"
            autoCapitalize="none"
            disabled={isLoading}
            left={<TextInput.Icon icon="web" />}
            style={[styles.input, { backgroundColor: colors.background }]}
            placeholder="https://meusite.com"
            theme={{
              colors: {
                primary: colors.primary,
                error: colors.error,
                outline: colors.border,
                onSurface: colors.text.primary,
                onSurfaceVariant: colors.text.secondary,
              }
            }}
          />
          <HelperText type="error" visible={!!errors.website} theme={{ colors: { error: colors.error } }}>
            {errors.website}
          </HelperText>

          <TextInput
            label="Instagram"
            value={instagram}
            onChangeText={setInstagram}
            onBlur={() => handleBlur('instagram', instagram)}
            error={!!errors.instagram}
            mode="outlined"
            keyboardType="url"
            autoCapitalize="none"
            disabled={isLoading}
            left={<TextInput.Icon icon="instagram" />}
            style={[styles.input, { backgroundColor: colors.background }]}
            placeholder="https://instagram.com/usuario"
            theme={{
              colors: {
                primary: colors.primary,
                error: colors.error,
                outline: colors.border,
                onSurface: colors.text.primary,
                onSurfaceVariant: colors.text.secondary,
              }
            }}
          />
          <HelperText type="error" visible={!!errors.instagram} theme={{ colors: { error: colors.error } }}>
            {errors.instagram}
          </HelperText>

          <TextInput
            label="Twitter/X"
            value={twitter}
            onChangeText={setTwitter}
            onBlur={() => handleBlur('twitter', twitter)}
            error={!!errors.twitter}
            mode="outlined"
            keyboardType="url"
            autoCapitalize="none"
            disabled={isLoading}
            left={<TextInput.Icon icon="twitter" />}
            style={[styles.input, { backgroundColor: colors.background }]}
            placeholder="https://twitter.com/usuario"
            theme={{
              colors: {
                primary: colors.primary,
                error: colors.error,
                outline: colors.border,
                onSurface: colors.text.primary,
                onSurfaceVariant: colors.text.secondary,
              }
            }}
          />
          <HelperText type="error" visible={!!errors.twitter} theme={{ colors: { error: colors.error } }}>
            {errors.twitter}
          </HelperText>

          <TextInput
            label="LinkedIn"
            value={linkedin}
            onChangeText={setLinkedin}
            onBlur={() => handleBlur('linkedin', linkedin)}
            error={!!errors.linkedin}
            mode="outlined"
            keyboardType="url"
            autoCapitalize="none"
            disabled={isLoading}
            left={<TextInput.Icon icon="linkedin" />}
            style={[styles.input, { backgroundColor: colors.background }]}
            placeholder="https://linkedin.com/in/usuario"
            theme={{
              colors: {
                primary: colors.primary,
                error: colors.error,
                outline: colors.border,
                onSurface: colors.text.primary,
                onSurfaceVariant: colors.text.secondary,
              }
            }}
          />
          <HelperText type="error" visible={!!errors.linkedin} theme={{ colors: { error: colors.error } }}>
            {errors.linkedin}
          </HelperText>

          {/* Botão Salvar */}
          <Button
            mode="contained"
            onPress={handleSave}
            disabled={isLoading}
            loading={isLoading}
            style={[styles.button, { backgroundColor: colors.primary }]}
            contentStyle={styles.buttonContent}
            labelStyle={[styles.buttonLabel, { color: colors.onPrimary }]}
            theme={{
              colors: {
                primary: colors.primary,
              }
            }}
          >
            {isLoading ? 'Salvando...' : 'Salvar Alterações'}
          </Button>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: 10,
  },
  cancelButton: {
    fontSize: 16,
    fontWeight: '500',
  },
  title: {
    fontWeight: 'bold',
  },
  headerSpacer: {
    width: 70,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.surface,
  },
  defaultAvatar: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: colors.onPrimary,
  },
  changePhotoText: {
    fontSize: 14,
    fontWeight: '500',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  input: {
    width: '100%',
    marginBottom: 0,
    backgroundColor: colors.background,
  },
  emailButton: {
    marginTop: 8,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  sectionTitle: {
    marginTop: 20,
    marginBottom: 12,
    fontWeight: '600',
  },
  button: {
    width: '100%',
    marginTop: 30,
    marginBottom: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonContent: {
    height: 50,
  },
  buttonLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  successText: {
    color: '#4CAF50',
  },
});
