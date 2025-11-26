import streamlit as st
import pandas as pd

# -----------------------------------------------------------------------------
# 1. إعدادات الصفحة ووظيفة تحميل البيانات
# -----------------------------------------------------------------------------

# ضبط إعدادات الصفحة (العنوان والأيقونة)
st.set_page_config(page_title="Workout Finder", page_icon="💪", layout="wide")

# استخدام الكاش لتسريع تحميل البيانات
@st.cache_data
def load_data(uploaded_file):
    """
    تحميل البيانات من ملف تم رفعه (CSV أو Excel).
    """
    try:
        # --- التحقق من نوع الملف من اسمه ---
        if uploaded_file.name.endswith('.csv'):
            df = pd.read_csv(uploaded_file)
        elif uploaded_file.name.endswith(('.xls', '.xlsx')):
            df = pd.read_excel(uploaded_file)
        else:
            st.error("خطأ: نوع الملف غير مدعوم. الرجاء رفع ملف CSV أو Excel.")
            return None
            
        # --- تنظيف أسماء الأعمدة ---
        df.columns = df.columns.str.strip().str.lower().str.replace(' ', '_')
        return df
        
    except Exception as e:
        st.error(f"خطأ أثناء قراءة الملف: {e}")
        return None

# -----------------------------------------------------------------------------
# 2. الواجهة الرئيسية ورفع الملفات
# -----------------------------------------------------------------------------

st.title("💪 Workout Finder App (تطبيق البحث عن التمارين)")
st.write("استخدم الفلاتر في الشريط الجانبي للعثور على التمرين المثالي لك.")

# 1. إضافة أداة رفع الملفات في الشريط الجانبي
st.sidebar.header("1. Upload Data File (ارفع ملف البيانات)")
uploaded_file = st.sidebar.file_uploader("Choose a CSV or Excel file", type=["csv", "xls", "xlsx"])

# 2. تهيئة df وانتظار رفع الملف
df = None 

if uploaded_file is not None:
    # 3. تحميل البيانات فقط إذا تم رفع ملف
    df = load_data(uploaded_file)
else:
    # 4. عرض رسالة ترحيبية قبل رفع الملف
    st.info("👋 Welcome! Please upload your workout data file (CSV or Excel) to begin.")
    st.info("👋 أهلاً بك! الرجاء رفع ملف بيانات التمارين (CSV أو Excel) للبدء.")


# -----------------------------------------------------------------------------
# 3. الفلاتر وعرض النتائج (يعمل فقط إذا تم تحميل البيانات بنجاح)
# -----------------------------------------------------------------------------

if df is not None and not df.empty:
    
    st.sidebar.header("2. Filter Your Workout (فلتر التمارين)")

    # --- فحص الأعمدة المطلوبة ---
    # *** تم التعديل هنا: إضافة 'id' ***
    required_cols = ['body_part', 'target_area', 'level', 'name', 'gif_link', 'id']
    missing_cols = [col for col in required_cols if col not in df.columns]
    
    if missing_cols:
        st.error(f"خطأ: الملف الذي تم رفعه يفتقد للأعمدة المطلوبة: {', '.join(missing_cols)}")
        st.error(f"الرجاء التأكد من أن الملف يحتوي على ({', '.join(required_cols)}) بعد تنظيف الأسماء.")
    else:
        # --- إذا كانت جميع الأعمدة موجودة، اعرض الفلاتر ---

        # --- الفلتر الأول: جزء الجسم (Body Part) ---
        body_parts = ["All"] + list(df['body_part'].unique())
        selected_body_part = st.sidebar.selectbox("1. Select Body Part (اختر جزء الجسم):", body_parts)

        # --- فلترة البيانات بناءً على الاختيار الأول ---
        if selected_body_part == "All":
            df_filtered_step1 = df
        else:
            df_filtered_step1 = df[df['body_part'] == selected_body_part]

        # --- الفلتر الثاني: المنطقة المستهدفة (Target Area) ---
        target_areas = ["All"] + list(df_filtered_step1['target_area'].unique())
        selected_target = st.sidebar.selectbox("2. Select Target Area (اختر المنطقة المستهدفة):", target_areas)

        # --- فلترة البيانات بناءً على الاختيار الثاني ---
        if selected_target == "All":
            df_filtered_step2 = df_filtered_step1
        else:
            df_filtered_step2 = df_filtered_step1[df_filtered_step1['target_area'] == selected_target]

        # --- الفلتر الثالث: المستوى (Level) ---
        levels = ["All"] + list(df_filtered_step2['level'].unique())
        selected_level = st.sidebar.selectbox("3. Select Level (اختر مستواك):", levels)

        # --- الفلترة النهائية ---
        if selected_level == "All":
            final_df = df_filtered_step2
        else:
            final_df = df_filtered_step2[df_filtered_step2['level'] == selected_level]

        # -----------------------------------------------------------------------------
        # 4. عرض النتائج (بالترتيب المطلوب)
        # -----------------------------------------------------------------------------

        st.header(f"Found {len(final_df)} Exercises (تم إيجاد {len(final_df)} تمرين)")
        st.divider()

        if final_df.empty:
            st.warning("No exercises found matching your criteria. Please broaden your filters.")
            st.warning("لم يتم العثور على تمارين تطابق بحثك. الرجاء توسيع نطاق الفلاتر.")
        else:
            # عرض النتائج في بطاقات منظمة
            for index, row in final_df.iterrows():
                # *** تم التعديل هنا: إزالة 'border=True' ***
                with st.container():
                    
                    col1, col2 = st.columns([1, 2]) 

                    with col1:
                        if pd.notna(row['gif_link']):
                            # Check if it's a URL or local file path
                            gif_path = str(row['gif_link'])
                            if gif_path.startswith(('http://', 'https://')):
                                st.image(gif_path, caption=row['name'], width='stretch')
                            else:
                                st.info("GIF is a local file path, not accessible")
                        else:
                            st.write("No GIF available")

                    with col2:
                        # --- عرض البيانات بالترتيب المطلوب ---
                        
                        # 1. Exercise Name
                        st.subheader(row['name'])
                        
                        # --- *** الإضافة الجديدة هنا *** ---
                        # 1.b. ID
                        st.caption(f"ID: {row['id']}")
                        # --- *** نهاية الإضافة *** ---
                        
                        # 2. Description
                        if 'description' in df.columns and pd.notna(row['description']):
                            st.write(f"**Description:** {row['description']}")
                        
                        # 3. Level
                        st.write(f"**Level:** {row['level']}")
                        
                        # 4. Target
                        st.write(f"**Target:** {row['target_area']}")

                        # 5. Equipment
                        if 'equipment' in df.columns and pd.notna(row['equipment']):
                            st.write(f"**Equipment (الأداة):** {row['equipment']}")

                st.write("") # لإضافة مسافة بين البطاقات

elif uploaded_file is not None:
    st.error("Data could not be loaded or the file is empty. Please check the file integrity.")
    st.error("لم يتم تحميل البيانات أو أن الملف فارغ. الرجاء مراجعة الملف.")