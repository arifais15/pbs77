import { getDb } from '@/lib/db';
import { normalizeToEnglish } from '@/lib/numeral-converter';

export function normalizeExistingData() {
  try {
    const db = getDb();
    const consumers = db.prepare('SELECT id, accNo, meterNo, mobile FROM consumers').all();
    
    let updated = 0;
    consumers.forEach((consumer: any) => {
      const normalizedAccNo = normalizeToEnglish(consumer.accNo);
      const normalizedMeterNo = normalizeToEnglish(consumer.meterNo || '');
      const normalizedMobile = normalizeToEnglish(consumer.mobile || '');
      
      // Only update if something changed
      if (normalizedAccNo !== consumer.accNo || 
          normalizedMeterNo !== consumer.meterNo || 
          normalizedMobile !== consumer.mobile) {
        
        db.prepare(`
          UPDATE consumers 
          SET accNo = ?, meterNo = ?, mobile = ?
          WHERE id = ?
        `).run(normalizedAccNo, normalizedMeterNo, normalizedMobile, consumer.id);
        
        updated++;
      }
    });
    
    console.log(`✓ Normalized ${updated} consumer records`);
    return updated;
  } catch (error) {
    console.error('Error normalizing data:', error);
    return 0;
  }
}
