import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Camera, Check, Eye, EyeOff, Loader2, Pencil, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDispatch, useSelector } from "react-redux";
import { selectCurrentToken, selectCurrentUser, setCredentials } from "@/features/auth/authSlice";
import { useChangePasswordMutation, useUpdateUserProfileMutation } from "@/features/user/userApi";


const PASSWORD_STRENGTH_LABELS = ["Weak", "Fair", "Good", "Strong"];
const PASSWORD_STRENGTH_COLORS = ["bg-destructive", "bg-warning", "bg-primary", "bg-success"];

const emptyProfile = {
    first_name: "",
    last_name: "",
    email: "",
    countryCode: "",
    localPhone: "",
    phoneNumber: "",
    address: "",
    avatarUrl: "",
};

const splitPhoneNumber = (value = "") => {
    const trimmed = String(value || "").trim();
    if (!trimmed) return { countryCode: "", localPhone: "" };

    if (trimmed.startsWith("+")) {
        const match = trimmed.match(/^(\+\d{1,4})[\s-]*(.*)$/);
        if (match) {
            return {
                countryCode: match[1],
                localPhone: match[2] || "",
            };
        }
    }

    return { countryCode: "", localPhone: trimmed };
};

const buildPhoneNumber = (countryCode, localPhone) => {
    const code = (countryCode || "").trim();
    const local = (localPhone || "").trim();
    if (!code && !local) return "";
    if (!code) return local;
    if (!local) return code;
    return `${code} ${local}`.trim();
};

const normalizeProfile = (source = {}) => {
    const rawPhone = source.phoneNumber ?? source.phone ?? "";
    const { countryCode, localPhone } = splitPhoneNumber(rawPhone);

    return {
        first_name: source.first_name ?? source.firstName ?? "",
        last_name: source.last_name ?? source.lastName ?? "",
        email: source.email ?? "",
        countryCode,
        localPhone,
        phoneNumber: buildPhoneNumber(countryCode, localPhone),
        address: source.address ?? "",
        avatarUrl: source.avatarUrl ?? source.profile ?? "",
    };
};

const validateCountryCode = (countryCode) => {
    if (!countryCode) return null;
    if (!/^\+\d{1,4}$/.test(countryCode.trim())) {
        return "Country code must be like +1 or +91";
    }
    return null;
};

const validateLocalPhone = (localPhone, hasCountryCode) => {
    if (!localPhone && !hasCountryCode) return null;
    if (!localPhone && hasCountryCode) return "Phone number is required";

    const trimmed = localPhone.trim();
    if (!/^[\d\s()-]+$/.test(trimmed)) {
        return "Phone number can contain only digits, spaces, parentheses, and dashes";
    }

    const digitsOnly = trimmed.replace(/\D/g, "");
    const minDigits = hasCountryCode ? 6 : 10;
    if (digitsOnly.length < minDigits || digitsOnly.length > 15) {
        return hasCountryCode
            ? "Phone number must be 6 to 15 digits with country code"
            : "Phone number must be 10 to 15 digits";
    }

    return null;
};

function PasswordStrength({ password }) {
    const getStrength = (pw) => {
        let score = 0;
        if (pw.length >= 8) score += 1;
        if (/[A-Z]/.test(pw)) score += 1;
        if (/[0-9]/.test(pw)) score += 1;
        if (/[^A-Za-z0-9]/.test(pw)) score += 1;
        return score;
    };

    if (!password) return null;

    const strength = getStrength(password);

    return (
        <div className="space-y-1.5">
            <div className="flex gap-1">
                {[0, 1, 2, 3].map((index) => (
                    <div
                        key={index}
                        className={cn(
                            "h-1.5 flex-1 rounded-full transition-colors",
                            index < strength ? PASSWORD_STRENGTH_COLORS[strength - 1] : "bg-muted"
                        )}
                    />
                ))}
            </div>
            <p className="text-xs text-muted-foreground">
                Password strength: {PASSWORD_STRENGTH_LABELS[strength - 1] || "Too short"}
            </p>
        </div>
    );
}

export function Profile({
    title = "Profile",
    subtitle = "Manage your profile information and settings",
    defaultProfile,
    showPasswordTab = true,
    emailEditable = false,
    onSaveProfile,
    onUpdatePassword,
    className,
}) {

    const dispatch = useDispatch();
    const user = useSelector(selectCurrentUser);
    const token = useSelector(selectCurrentToken);
    const [updateUserProfile] = useUpdateUserProfileMutation();
    const [changePassword] = useChangePasswordMutation();
    const { toast } = useToast();
    const fileInputRef = useRef(null);

    const [isEditing, setIsEditing] = useState(false);
    const [profile, setProfile] = useState(emptyProfile);
    const [editProfile, setEditProfile] = useState(emptyProfile);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isEditing) return;
        const source = defaultProfile || user || emptyProfile;
        const nextProfile = normalizeProfile(source);
        setProfile(nextProfile);
        setEditProfile(nextProfile);
    }, [defaultProfile, user, isEditing]);

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrentPw, setShowCurrentPw] = useState(false);
    const [showNewPw, setShowNewPw] = useState(false);
    const [showConfirmPw, setShowConfirmPw] = useState(false);
    const [pwErrors, setPwErrors] = useState({});
    const [updatingPw, setUpdatingPw] = useState(false);

    const validateProfile = () => {
        const nextErrors = {};

        if (!editProfile.first_name?.trim()) nextErrors.first_name = "First name is required";
        if (!editProfile.last_name?.trim()) nextErrors.last_name = "Last name is required";
        const countryCodeError = validateCountryCode(editProfile.countryCode);
        const localPhoneError = validateLocalPhone(editProfile.localPhone, !!editProfile.countryCode);
        if (countryCodeError) nextErrors.countryCode = countryCodeError;
        if (localPhoneError) nextErrors.localPhone = localPhoneError;

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateProfile()) return;

        setSaving(true);

        try {
            const payload = {
                first_name: editProfile.first_name?.trim() || "",
                last_name: editProfile.last_name?.trim() || "",
                phoneNumber: buildPhoneNumber(editProfile.countryCode, editProfile.localPhone),
                address: editProfile.address || "",
            };

            let updatedData = null;
            if (onSaveProfile) {
                updatedData = await onSaveProfile(payload);
            } else {
                const response = await updateUserProfile(payload).unwrap();
                updatedData = response?.data || response?.user || null;
            }

            const nextProfile = normalizeProfile({
                ...(user || {}),
                ...payload,
                ...(updatedData || {}),
            });

            const mergedUser = {
                ...(user || {}),
                ...payload,
                ...(updatedData || {}),
            };
            dispatch(
                setCredentials({
                    user: mergedUser,
                    token: token || localStorage.getItem("token"),
                })
            );

            setProfile(nextProfile);
            setEditProfile(nextProfile);
            setIsEditing(false);
            toast({ title: "Profile updated", description: "Your profile has been saved successfully." });
        } catch (error) {
            toast({
                title: "Update failed",
                description: error?.message || "Unable to save profile changes.",
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setEditProfile(profile);
        setIsEditing(false);
        setErrors({});
    };

    const handleAvatarChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const previewUrl = URL.createObjectURL(file);
        setEditProfile((prev) => ({ ...prev, avatarUrl: previewUrl }));
    };

    const handleUpdatePassword = async () => {
        const nextErrors = {};

        if (!currentPassword) nextErrors.current = "Current password is required";
        if (newPassword.length < 8) nextErrors.new = "Password must be at least 8 characters";
        if (newPassword !== confirmPassword) nextErrors.confirm = "Passwords do not match";

        setPwErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) return;

        setUpdatingPw(true);

        try {
            if (onUpdatePassword) {
                await onUpdatePassword({ currentPassword, newPassword, confirmPassword });
            }
            else {
                const passwordData = {
                    currentPassword,
                    newPassword,
                    confirmNewPassword: confirmPassword,
                };
                await changePassword(passwordData).unwrap();
            }

            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setPwErrors({});
            toast({ title: "Password updated", description: "Your password has been changed." });
        } catch (error) {
            toast({
                title: "Password update failed",
                description: error?.message || "Unable to update your password.",
                variant: "destructive",
            });
        } finally {
            setUpdatingPw(false);
        }
    };

    const displayProfile = (isEditing ? editProfile : profile) || emptyProfile;
    const initials = `${displayProfile?.first_name?.[0] || ""}${displayProfile?.last_name?.[0] || ""}`;



    return (
        <div className={cn("w-full max-w-3xl mx-auto space-y-1 animate-fade-in", className)}>
            <div>
                <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
                <p className="text-muted-foreground text-sm">{subtitle}</p>
            </div>
            <Tabs defaultValue="personal" className="w-full">
                <TabsList className="w-full justify-start">
                    <TabsTrigger value="personal">Personal Information</TabsTrigger>
                    {showPasswordTab && <TabsTrigger value="password">Change Password</TabsTrigger>}
                </TabsList>

                <TabsContent value="personal">
                    <Card className="shadow-sm border-border">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-lg">Personal Information</CardTitle>
                                <CardDescription>Update your personal details</CardDescription>
                            </div>
                            {!isEditing ? (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setEditProfile(profile);
                                        setIsEditing(true);
                                    }}
                                >
                                    <Pencil className="w-4 h-4 mr-1" /> Edit
                                </Button>
                            ) : (
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="sm" onClick={handleCancel} disabled={saving}>
                                        <X className="w-4 h-4 mr-1" /> Cancel
                                    </Button>
                                    <Button size="sm" onClick={handleSave} disabled={saving}>
                                        {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Check className="w-4 h-4 mr-1" />}
                                        Save
                                    </Button>
                                </div>
                            )}
                        </CardHeader>

                        <CardContent className="space-y-1">
                            <div className="flex items-center gap-4">
                                <div
                                    className={cn("relative group", isEditing ? "cursor-pointer" : "cursor-default")}
                                    onClick={() => {
                                        if (isEditing) fileInputRef.current?.click();
                                    }}
                                >
                                    <Avatar className="h-20 w-20">
                                        <AvatarImage src={displayProfile?.avatarUrl} />
                                        <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                                            {initials}
                                        </AvatarFallback>
                                    </Avatar>

                                    {isEditing && (
                                        <div className="absolute inset-0 rounded-full bg-foreground/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Camera className="w-5 h-5 text-primary-foreground" />
                                        </div>
                                    )}

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleAvatarChange}
                                    />
                                </div>

                                <div>
                                    <p className="font-medium text-foreground">
                                        {displayProfile?.first_name} {displayProfile?.last_name}
                                    </p>
                                    <p className="text-sm text-muted-foreground">{displayProfile?.email}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>First Name</Label>
                                    <Input
                                        value={displayProfile.first_name || ""}
                                        onChange={(event) => setEditProfile((prev) => ({ ...prev, first_name: event.target.value }))}
                                        disabled={!isEditing}
                                        className={errors.first_name ? "border-destructive" : ""}
                                    />
                                    {errors.first_name && <p className="text-xs text-destructive">{errors.first_name}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label>Last Name</Label>
                                    <Input
                                        value={displayProfile.last_name || ""}
                                        onChange={(event) => setEditProfile((prev) => ({ ...prev, last_name: event.target.value }))}
                                        disabled={!isEditing}
                                        className={errors.last_name ? "border-destructive" : ""}
                                    />
                                    {errors.last_name && <p className="text-xs text-destructive">{errors.last_name}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input
                                        value={displayProfile?.email || ""}
                                        onChange={(event) => setEditProfile((prev) => ({ ...prev, email: event.target.value }))}
                                        disabled={!isEditing || !emailEditable}
                                        className={emailEditable && isEditing ? "" : "bg-muted/50"}
                                    />
                                    {!emailEditable && <p className="text-xs text-muted-foreground">Email cannot be changed</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label>Phone Number</Label>
                                    <div className="grid grid-cols-[40px_minmax(0,1fr)] gap-2">
                                        <Input
                                            value={displayProfile?.countryCode || ""}
                                            onChange={(event) =>
                                                setEditProfile((prev) => {
                                                    const countryCode = event.target.value;
                                                    return {
                                                        ...prev,
                                                        countryCode,
                                                        phoneNumber: buildPhoneNumber(countryCode, prev.localPhone),
                                                    };
                                                })
                                            }
                                            disabled={!isEditing}
                                            placeholder="+1"
                                            className={errors.countryCode ? "border-destructive" : ""}
                                        />
                                        <Input
                                            value={displayProfile?.localPhone || ""}
                                            onChange={(event) =>
                                                setEditProfile((prev) => {
                                                    const localPhone = event.target.value;
                                                    return {
                                                        ...prev,
                                                        localPhone,
                                                        phoneNumber: buildPhoneNumber(prev.countryCode, localPhone),
                                                    };
                                                })
                                            }
                                            disabled={!isEditing}
                                            placeholder="555 000 0000"
                                            className={errors.localPhone ? "border-destructive" : ""}
                                        />
                                    </div>
                                    {errors.countryCode && <p className="text-xs text-destructive">{errors.countryCode}</p>}
                                    {errors.localPhone && <p className="text-xs text-destructive">{errors.localPhone}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Address</Label>
                                <Textarea
                                    value={displayProfile?.address || ""}
                                    onChange={(event) => setEditProfile((prev) => ({ ...prev, address: event.target.value }))}
                                    disabled={!isEditing}
                                    rows={3}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {showPasswordTab && (
                    <TabsContent value="password">
                        <Card className="shadow-sm border-border">
                            <CardHeader>
                                <CardTitle className="text-lg">Change Password</CardTitle>
                                <CardDescription>Ensure your account is secure with a strong password</CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Current Password</Label>
                                    <div className="relative">
                                        <Input
                                            type={showCurrentPw ? "text" : "password"}
                                            value={currentPassword}
                                            onChange={(event) => setCurrentPassword(event.target.value)}
                                            className={pwErrors.current ? "border-destructive pr-10" : "pr-10"}
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                            onClick={() => setShowCurrentPw((prev) => !prev)}
                                        >
                                            {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {pwErrors.current && <p className="text-xs text-destructive">{pwErrors.current}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label>New Password</Label>
                                    <div className="relative">
                                        <Input
                                            type={showNewPw ? "text" : "password"}
                                            value={newPassword}
                                            onChange={(event) => setNewPassword(event.target.value)}
                                            className={pwErrors.new ? "border-destructive pr-10" : "pr-10"}
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                            onClick={() => setShowNewPw((prev) => !prev)}
                                        >
                                            {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    <PasswordStrength password={newPassword} />
                                    {pwErrors.new && <p className="text-xs text-destructive">{pwErrors.new}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label>Confirm Password</Label>
                                    <div className="relative">
                                        <Input
                                            type={showConfirmPw ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={(event) => setConfirmPassword(event.target.value)}
                                            className={pwErrors.confirm ? "border-destructive pr-10" : "pr-10"}
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                            onClick={() => setShowConfirmPw((prev) => !prev)}
                                        >
                                            {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {pwErrors.confirm && <p className="text-xs text-destructive">{pwErrors.confirm}</p>}
                                </div>

                                <Button onClick={handleUpdatePassword} disabled={updatingPw} className="mt-2">
                                    {updatingPw && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    Update Password
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>
                )}
            </Tabs>
        </div>
    );
}

export default function AdminProfile(props) {
    return <Profile title="Profile" subtitle="Manage your account settings" {...props} />;
}
