import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const VALID_ROLES = ["super_admin", "admin", "editor"] as const;
type Role = (typeof VALID_ROLES)[number];

/**
 * GET /api/admin/users
 * Retorna todos os usuários administrativos e operadores cadastrados no sistema.
 */
export async function GET() {
  try {
    const adminSupabase = createAdminClient();

    // 1. Busca perfis administrativos na tabela admin_profiles
    const { data: profiles, error } = await adminSupabase
      .from("admin_profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[API Users GET] Erro ao buscar perfis:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Se estiver vazio, garante perfil padrão da diretoria
    if (!profiles || profiles.length === 0) {
      const canonicalEmail = "admin@oticasventara.com.br";
      const { data: authList } = await adminSupabase.auth.admin.listUsers();
      let userId = authList?.users?.find((u) => u.email === canonicalEmail)?.id;

      if (!userId) {
        const { data: newUser } = await adminSupabase.auth.admin.createUser({
          email: canonicalEmail,
          password: "Ventara@Master2026!",
          email_confirm: true,
          user_metadata: { full_name: "Diretoria Óticas Ventara" },
        });
        userId = newUser?.user?.id;
      }

      if (userId) {
        const { data: newProfile } = await adminSupabase
          .from("admin_profiles")
          .upsert(
            {
              id: userId,
              email: canonicalEmail,
              full_name: "Diretoria Óticas Ventara",
              role: "super_admin",
            },
            { onConflict: "id" }
          )
          .select()
          .single();

        return NextResponse.json({
          success: true,
          users: newProfile ? [newProfile] : [],
        });
      }
    }

    return NextResponse.json({ success: true, users: profiles || [] });
  } catch (err: any) {
    console.error("[API Users GET] Erro interno:", err);
    return NextResponse.json(
      { error: err.message || "Erro interno ao listar usuários." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/users
 * Cadastra um novo operador/administrador no Supabase Auth e em admin_profiles.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = body.email?.trim().toLowerCase();
    const fullName = body.full_name?.trim() || "Operador";
    const role: Role = VALID_ROLES.includes(body.role) ? body.role : "editor";
    const password = body.password?.trim() || "Ventara@2026";

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "E-mail válido é obrigatório." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "A senha de acesso deve ter pelo menos 6 caracteres." },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();

    // 1. Verifica se já existe perfil cadastrado com esse email
    const { data: existingProfile } = await adminSupabase
      .from("admin_profiles")
      .select("id, email")
      .eq("email", email)
      .maybeSingle();

    if (existingProfile) {
      return NextResponse.json(
        { error: `Já existe um operador cadastrado com o e-mail ${email}.` },
        { status: 409 }
      );
    }

    // 2. Busca ou cria o usuário no Supabase Auth
    const { data: authList } = await adminSupabase.auth.admin.listUsers();
    let authUser = authList?.users?.find((u) => u.email?.toLowerCase() === email);

    if (!authUser) {
      const { data: createdAuth, error: createAuthErr } =
        await adminSupabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { full_name: fullName, role },
        });

      if (createAuthErr) {
        console.error("[API Users POST] Erro ao criar Auth User:", createAuthErr);
        return NextResponse.json(
          { error: `Falha na autenticação: ${createAuthErr.message}` },
          { status: 500 }
        );
      }

      authUser = createdAuth.user;
    }

    if (!authUser?.id) {
      return NextResponse.json(
        { error: "Não foi possível obter o ID de autenticação do usuário." },
        { status: 500 }
      );
    }

    // 3. Insere na tabela admin_profiles
    const { data: profile, error: profileErr } = await adminSupabase
      .from("admin_profiles")
      .upsert(
        {
          id: authUser.id,
          email,
          full_name: fullName,
          role,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      )
      .select()
      .single();

    if (profileErr) {
      console.error("[API Users POST] Erro ao salvar admin_profile:", profileErr);
      return NextResponse.json(
        { error: `Erro ao salvar perfil: ${profileErr.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Usuário operador cadastrado com sucesso!",
        user: profile,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("[API Users POST] Erro interno:", err);
    return NextResponse.json(
      { error: err.message || "Erro ao cadastrar usuário." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/users
 * Remove um usuário operador permanentemente do sistema (admin_profiles e auth.users).
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id");

    if (!id) {
      try {
        const body = await req.json();
        id = body?.id;
      } catch {
        // body opcional
      }
    }

    if (!id) {
      return NextResponse.json(
        { error: "ID do usuário é obrigatório para exclusão." },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();

    // 1. Remove da tabela admin_profiles
    const { error: profileErr } = await adminSupabase
      .from("admin_profiles")
      .delete()
      .eq("id", id);

    if (profileErr) {
      console.error("[API Users DELETE] Erro ao remover de admin_profiles:", profileErr);
    }

    // 2. Remove do Supabase Auth (se existir)
    const { error: authErr } = await adminSupabase.auth.admin.deleteUser(id);
    if (authErr) {
      console.warn("[API Users DELETE] Aviso ao deletar Auth User (pode já estar ausente):", authErr.message);
    }

    return NextResponse.json({
      success: true,
      message: "Usuário removido com sucesso.",
      id,
    });
  } catch (err: any) {
    console.error("[API Users DELETE] Erro interno:", err);
    return NextResponse.json(
      { error: err.message || "Erro ao excluir usuário." },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/users
 * Atualiza o nível de acesso (role), nome ou redefinição de senha do usuário.
 */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, role, full_name, password } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID do usuário é obrigatório para atualização." },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();
    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (role && VALID_ROLES.includes(role)) {
      updatePayload.role = role;
    }

    if (full_name !== undefined) {
      updatePayload.full_name = full_name?.trim() || null;
    }

    // Atualiza tabela admin_profiles
    const { data: updatedProfile, error: updateErr } = await adminSupabase
      .from("admin_profiles")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (updateErr) {
      console.error("[API Users PATCH] Erro ao atualizar perfil:", updateErr);
      return NextResponse.json(
        { error: updateErr.message },
        { status: 500 }
      );
    }

    // Se senha foi fornecida, atualiza no Supabase Auth
    if (password && password.length >= 6) {
      await adminSupabase.auth.admin.updateUserById(id, {
        password,
        user_metadata: { full_name: updatedProfile.full_name, role: updatedProfile.role },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Usuário atualizado com sucesso.",
      user: updatedProfile,
    });
  } catch (err: any) {
    console.error("[API Users PATCH] Erro interno:", err);
    return NextResponse.json(
      { error: err.message || "Erro ao atualizar usuário." },
      { status: 500 }
    );
  }
}
